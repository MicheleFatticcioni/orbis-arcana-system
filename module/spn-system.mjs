// Import document classes.
import { SPNSystemActor } from "./documents/actor.mjs";
import { SPNSystemItem } from "./documents/item.mjs";
// Import sheet classes.
import { SPNSystemActorSheet } from "./sheets/actor-sheet.mjs";
import { SPNSystemItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { SPN_SYSTEM } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.spnsystem = {
    SPNSystemActor,
    SPNSystemItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.SPN_SYSTEM = SPN_SYSTEM;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = SPNSystemActor;
  CONFIG.Item.documentClass = SPNSystemItem;

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("spn-system", SPNSystemActorSheet, {
    makeDefault: true,
    label: "SPN_SYSTEM.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("spn-system", SPNSystemItemSheet, {
    makeDefault: true,
    label: "SPN_SYSTEM.SheetLabels.Item",
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("stringify", function (obj) {
  return JSON.stringify(obj);
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("sum", function (...args) {
  const options = args.pop(); // Rimuove l’oggetto options
  console.log(args);
  return args.reduce((acc, val) => acc + Number(val), 0);
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

Hooks.on("renderChatMessage", (message, html, data) => {
  // Listen for Force Roll button click
  html.find(".force-roll-button").click(async (ev) => {
    ev.preventDefault();

    // Get stored roll data from flags
    const rollData = message.getFlag("spn-system", "rollData");
    if (!rollData) return;

    // Helper to separate filtered dice (kept vs reroll) works per pool
    // We need to keep 1s (cursed) and 6s (success)
    async function processPool(poolDice) {
      let kept = [];
      let rerollCount = 0;

      for (let d of poolDice) {
        if (d.result === 1 || d.result === 6) {
          kept.push(d);
        } else {
          rerollCount++;
        }
      }

      let newDice = [];
      if (rerollCount > 0) {
        const r = new Roll(`${rerollCount}d6`);
        await r.evaluate();
        newDice = r.dice[0].results;

        if (game.settings.get("core", "rollMode") !== "blind") {
          AudioHelper.play({ src: CONFIG.sounds.dice });
        }
      }

      return [...kept, ...newDice];
    }

    // Process each pool
    const newAttrDice = await processPool(rollData.attrDice);
    const newSkillDice = await processPool(rollData.skillDice);
    const newModDice = await processPool(rollData.modDice);
    const newCursedDice = await processPool(rollData.cursedDice); // Do we reroll cursed dice? "rilanciano tutti i risultati diversi da 6 e da 1".
    // Usually Cursed Dice are NOT rerolled in many systems or have special rules.
    // But the prompt says "tutti i risultati diversi da 6 e da 1".
    // If a Cursed die is 2-5, it's not 1 or 6. If it's 1 it's kept. If it's 6 it's kept.
    // Assuming strict interpretation: reroll them too.

    // Calculate new stats
    const getStats = (results) => ({
      success: results.filter((d) => d.result === 6).length,
      cursed: results.filter((d) => d.result === 1).length,
    });

    const attrStats = getStats(newAttrDice);
    const skillStats = getStats(newSkillDice);
    const modStats = getStats(newModDice);
    const cursedStats = getStats(newCursedDice);

    const allResults = [
      ...newAttrDice,
      ...newSkillDice,
      ...newModDice,
      ...newCursedDice,
    ];

    const successCount = allResults.filter((d) => d.result === 6).length;
    const totalCursedCount = allResults.filter((d) => d.result === 1).length;

    // Prepare new card data
    const cardData = {
      label: rollData.label + " (Forzato)",
      attributeKey: rollData.attributeKey,
      attributeDice: newAttrDice,
      attributeStats: attrStats,
      hasAttribute: newAttrDice.length > 0,

      skillLabel: rollData.skillLabel,
      skillDice: newSkillDice,
      skillStats: skillStats,
      hasSkill: newSkillDice.length > 0,

      cursedDice: newCursedDice,
      cursedStats: cursedStats,
      hasCursed: newCursedDice.length > 0,

      modifierDice: newModDice,
      modifierStats: modStats,
      hasModifier: newModDice.length > 0,

      successCount: successCount,
      cursedCount: totalCursedCount,
    };

    const content = await renderTemplate(
      "systems/spn-system/templates/chat/roll-card.hbs",
      cardData,
    );

    // Create new chat message
    ChatMessage.create({
      user: game.user.id,
      speaker: message.speaker,
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      flags: {
        "spn-system": {
          rollData: {
            attrDice: newAttrDice,
            skillDice: newSkillDice,
            modDice: newModDice,
            cursedDice: newCursedDice,
            label: rollData.label + " (Forzato)",
            attributeKey: rollData.attributeKey,
            skillLabel: rollData.skillLabel,
          },
        },
      },
    });
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items",
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.spnsystem.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command,
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "spn-system.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`,
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
