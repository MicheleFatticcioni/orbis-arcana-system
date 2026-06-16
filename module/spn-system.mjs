// Import document classes.
import { SPNSystemActor } from "./documents/actor.mjs";
import { SPNSystemItem } from "./documents/item.mjs";
// Import sheet classes.
import { SPNSystemActorSheet } from "./sheets/actor-sheet.mjs";
import { SPNSystemItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { SPN_SYSTEM } from "./helpers/config.mjs";
import { DEFAULT_DOTI } from "./helpers/default-doti.mjs";
import { DEFAULT_WEAPONS } from "./helpers/default-weapons.mjs";

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

Handlebars.registerHelper("gte", function (a, b) {
  return Number(a) >= Number(b);
});

Handlebars.registerHelper("range", function (start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
});

Handlebars.registerHelper("conditionLabel", function (value) {
  const labels = { 5: "Eccellente", 4: "Buono", 3: "Accettabile", 2: "Scarso", 1: "Pessimo" };
  return labels[Number(value)] ?? "—";
});

Handlebars.registerHelper("conditionClass", function (value) {
  const classes = { 5: "condition-excellent", 4: "condition-good", 3: "condition-acceptable", 2: "condition-poor", 1: "condition-bad" };
  return classes[Number(value)] ?? "";
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
  await _createDotiFolders();
  await _createDefaultWeapons();
});

async function _createDotiFolders() {
  if (!game.user.isGM) return;

  // Esci solo se gli item esistono già
  if (game.items.find(i => i.type === "feature" && i.folder)) return;

  const TIPI = [
    ["Generico",   "#888888", "generico"],
    ["Cacciatore", "#8B4513", "cacciatore"],
    ["Occultista", "#4B0082", "occultista"],
    ["Truffatore", "#2F4F4F", "truffatore"],
    ["Letterato",  "#8B6914", "letterato"]
  ];

  // Recupera o crea la cartella principale
  let principale = game.folders.find(f => f.name === "Doti" && f.type === "Item" && !f.folder);
  if (!principale) {
    principale = await Folder.create({ name: "Doti", type: "Item", color: "#5b3a8c", sorting: "a" });
  }

  // Recupera o crea le sottocartelle
  const sottocartelle = {};
  for (const [nome, colore, chiave] of TIPI) {
    let sub = game.folders.find(f => f.name === nome && f.type === "Item" && f.folder?.id === principale.id);
    if (!sub) {
      sub = await Folder.create({ name: nome, type: "Item", folder: principale.id, color: colore, sorting: "a" });
    }
    sottocartelle[chiave] = sub.id;
  }

  // Crea gli item
  for (const dote of DEFAULT_DOTI) {
    await Item.create({
      name: dote.name,
      type: "feature",
      folder: sottocartelle[dote.dotType],
      system: {
        description: dote.description,
        dotType: dote.dotType,
        currentLevel: 1,
        levels: dote.levels
      }
    });
  }
}

async function _createDefaultWeapons() {
  if (!game.user.isGM) return;
  if (game.items.find(i => i.type === "weapon")) return;

  let folder = game.folders.find(f => f.name === "Armi" && f.type === "Item" && !f.folder);
  if (!folder) {
    folder = await Folder.create({ name: "Armi", type: "Item", color: "#8B0000", sorting: "a" });
  }

  for (const weapon of DEFAULT_WEAPONS) {
    await Item.create({
      name: weapon.name,
      type: "weapon",
      folder: folder.id,
      system: {
        damage: weapon.damage,
        type: weapon.type,
        range_meters: weapon.range_meters,
        ammo: weapon.ammo,
        cost_euro: weapon.cost_euro,
        health_status: weapon.health_status
      }
    });
  }
}

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
    const newWeaponDice = await processPool(rollData.weaponDice || []);
    const newModDice = await processPool(rollData.modDice);
    const newCursedDice = await processPool(rollData.cursedDice);

    // Calculate new stats
    const getStats = (results) => ({
      success: results.filter((d) => d.result === 6).length,
      cursed: results.filter((d) => d.result === 1).length,
    });

    const attrStats = getStats(newAttrDice);
    const skillStats = getStats(newSkillDice);
    const weaponStats = getStats(newWeaponDice);
    const modStats = getStats(newModDice);
    const cursedStats = getStats(newCursedDice);

    const allResults = [
      ...newAttrDice,
      ...newSkillDice,
      ...newWeaponDice,
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

      hasWeapon: newWeaponDice.length > 0,
      weaponLabel: rollData.weaponLabel || "DANNO ARMA",
      weaponDice: newWeaponDice,
      weaponStats: weaponStats,

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
            weaponDice: newWeaponDice,
            modDice: newModDice,
            cursedDice: newCursedDice,
            label: rollData.label + " (Forzato)",
            attributeKey: rollData.attributeKey,
            skillLabel: rollData.skillLabel,
            weaponLabel: rollData.weaponLabel,
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
