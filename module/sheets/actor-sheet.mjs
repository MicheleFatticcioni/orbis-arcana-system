import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SPNSystemActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["spn-system", "sheet", "actor"],
      width: 800,
      height: 900,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/spn-system/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.document.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.SPN_SYSTEM;

    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      },
    );

    context.effects = prepareActiveEffectCategories(
      this.actor.allApplicableEffects(),
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // Group skills by attribute for display
    const skills = context.system.skills;
    const attributes = context.system.attributes;

    context.skillsByAttribute = {
      forza: [],
      agilita: [],
      spirito: [],
      ingegno: [],
    };

    for (let [key, skill] of Object.entries(skills)) {
      if (context.skillsByAttribute[skill.mod]) {
        // Add label for localization
        skill.label = game.i18n.localize(
          `SPN_SYSTEM.Skills.${key.charAt(0).toUpperCase() + key.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`,
        ); // Simple inflection or map lookup could be safer, trying heuristic
        // Safer approach: define map in JS or rely on lang file keys matching exactly.
        // Let's use the explicit mapping since keys in lang file are PascalCase mainly.
        const langKey = this._getSkillLangKey(key);
        skill.label = game.i18n.localize(`SPN_SYSTEM.Skills.${langKey}`);
        skill.key = key;
        context.skillsByAttribute[skill.mod].push(skill);
      }
    }
  }

  _getSkillLangKey(key) {
    const map = {
      prestanza: "Prestanza",
      resistenza: "Resistenza",
      rissa: "Rissa",
      armi_da_fuoco: "ArmiDaFuoco",
      furtivita: "Furtivita",
      gioco_di_mano: "GiocoDiMano",
      movimento: "Movimento",
      empatia: "Empatia",
      intuizione: "Intuizione",
      investigazione: "Investigazione",
      rituali: "Rituali",
      medicina: "Medicina",
      ingegneria: "Ingegneria",
      percezione: "Percezione",
      occultismo: "Occultismo",
    };
    return map[key] || key;
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    const gear = [];
    const features = [];
    const weapons = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === "item") gear.push(i);
      else if (i.type === "feature") features.push(i);
      else if (i.type === "weapon") weapons.push(i);
      else if (i.type === "spell") {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    context.gear = gear;
    context.features = features;
    context.weapons = weapons; // New weapon array
    context.spells = spells;

    // Fill weapons to ensuring 6 slots if needed for UI, but handlebars can handle loops.
    // The requirement was: "Armi: Slot dedicati per registrare fino a 6 armi."
    // We can just iterate the existing weapons.
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    html.on("click", ".item-create", this._onItemCreate.bind(this));

    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.on("click", ".item-chat", async (ev) => {
      ev.preventDefault();
      const itemId = ev.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (!item || item.type !== "feature") return;

      const level = item.system.currentLevel || 1;
      const levels = item.system.levels || [];
      const lvlData = levels[level - 1];

      let content = `<div class="dote-chat-card">
        <h3 class="dote-chat-title">${item.name}</h3>
        <div class="dote-chat-meta">
          <span class="dote-chat-type">${item.system.dotType || ""}</span>
          <span class="dote-chat-level">${game.i18n.localize("SPN_SYSTEM.FEATURE.LEVEL")} ${level}</span>
        </div>`;

      if (item.system.description) {
        content += `<p class="dote-chat-desc">${item.system.description}</p>`;
      }

      if (lvlData?.description) {
        content += `<p class="dote-chat-level-desc">${lvlData.description}</p>`;
      }

      if (lvlData?.modifier) {
        content += `<p class="dote-chat-modifier"><strong>${game.i18n.localize("SPN_SYSTEM.FEATURE.MODIFIER")}:</strong> ${lvlData.modifier}</p>`;
      }

      content += `</div>`;

      ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: content,
      });
    });

    html.on("click", ".rollable-level", async (ev) => {
      ev.preventDefault();
      const itemId = ev.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (!item || item.type !== "feature") return;
      const current = item.system.currentLevel || 1;
      const next = current >= 3 ? 1 : current + 1;
      await item.update({ "system.currentLevel": next });
    });

    html.on("click", ".weapon-attack", this._onWeaponAttack.bind(this));

    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities (Attributes) & Skills
    html.on("click", ".rollable", this._onRoll.bind(this));

    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    delete itemData.system["type"];
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onWeaponAttack(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if (!item || item.type !== "weapon") return;

    const weapon = item.system;
    const attrs = this.actor.system.attributes;
    const skills = this.actor.system.skills;
    const defaultAttr = weapon.type === "firearm" || weapon.type === "throwing" ? "agilita" : "forza";

    const content = await renderTemplate(
      "systems/spn-system/templates/dialog/weapon-attack-dialog.hbs",
      {
        weaponName: item.name,
        damage: weapon.damage,
        defaultAttr,
        forzaValue: attrs.forza.value,
        agilitaValue: attrs.agilita.value,
        rissaValue: skills.rissa.value,
        armiValue: skills.armi_da_fuoco.value,
      }
    );

    new Dialog(
      {
        title: `Attacco: ${item.name}`,
        content,
        buttons: {
          roll: {
            label: "TIRA",
            callback: (html) => {
              const attrKey = html.find('[name="attribute"]').val();
              const modifier = Number(html.find('[name="modifier"]').val()) || 0;
              const cursedDice = this.actor.system.tracks.dadi_maledetti.value || 0;

              const skillKey = attrKey === "agilita" ? "armi_da_fuoco" : "rissa";
              const skillLabel = attrKey === "agilita" ? "ARMI DA FUOCO" : "RISSA";
              const attrLabel = attrKey === "agilita" ? "AGILITÀ" : "FORZA";

              let effectiveAttr = attrs[attrKey].value;
              let effectiveSkill = skills[skillKey].value;
              let effectiveMod = modifier;

              if (effectiveMod < 0) {
                let reduce = Math.abs(effectiveMod);
                if (effectiveSkill >= reduce) {
                  effectiveSkill -= reduce;
                  reduce = 0;
                } else {
                  reduce -= effectiveSkill;
                  effectiveSkill = 0;
                  effectiveAttr = Math.max(0, effectiveAttr - reduce);
                }
                effectiveMod = 0;
              }

              async function rollPool(count) {
                if (count <= 0) return [];
                const r = new Roll(`${count}d6`);
                await r.evaluate();
                return r.dice[0].results;
              }

              (async () => {
                const attrResults = await rollPool(effectiveAttr);
                const skillResults = await rollPool(effectiveSkill);
                const weaponResults = await rollPool(weapon.damage);
                const modResults = await rollPool(effectiveMod);
                const cursedResults = await rollPool(cursedDice);

                const getStats = (results) => ({
                  success: results.filter((d) => d.result === 6).length,
                  cursed: results.filter((d) => d.result === 1).length,
                });

                const allResults = [...attrResults, ...skillResults, ...weaponResults, ...modResults, ...cursedResults];
                const successCount = allResults.filter((d) => d.result === 6).length;
                const totalCursedCount = allResults.filter((d) => d.result === 1).length;

                const cardData = {
                  label: `Attacco: ${item.name}`,
                  hasAttribute: attrResults.length > 0,
                  attributeKey: attrLabel,
                  attributeDice: attrResults,
                  attributeStats: getStats(attrResults),
                  hasSkill: skillResults.length > 0,
                  skillLabel,
                  skillDice: skillResults,
                  skillStats: getStats(skillResults),
                  hasWeapon: weaponResults.length > 0,
                  weaponLabel: "DANNO ARMA",
                  weaponDice: weaponResults,
                  weaponStats: getStats(weaponResults),
                  hasModifier: modResults.length > 0,
                  modifierDice: modResults,
                  modifierStats: getStats(modResults),
                  hasCursed: cursedResults.length > 0,
                  cursedDice: cursedResults,
                  cursedStats: getStats(cursedResults),
                  successCount,
                  cursedCount: totalCursedCount,
                };

                const chatHtml = await renderTemplate(
                  "systems/spn-system/templates/chat/roll-card.hbs",
                  cardData
                );

                if (game.settings.get("core", "rollMode") !== "blind") {
                  AudioHelper.play({ src: CONFIG.sounds.dice });
                }

                ChatMessage.create({
                  user: game.user.id,
                  speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                  content: chatHtml,
                  type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                  flags: {
                    "spn-system": {
                      rollData: {
                        attrDice: attrResults,
                        skillDice: skillResults,
                        weaponDice: weaponResults,
                        modDice: modResults,
                        cursedDice: cursedResults,
                        label: `Attacco: ${item.name}`,
                        attributeKey: attrLabel,
                        skillLabel,
                        weaponLabel: "DANNO ARMA",
                      },
                    },
                  },
                });
              })();
            },
          },
        },
        default: "roll",
      },
      { classes: ["orbis-dialog"] }
    ).render(true);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const cursedDice = this.actor.system.tracks.dadi_maledetti.value || 0;

    if (dataset.img) {
      // Just showing an image/modal? No standard roll behavior described for clicking attribute box just to show value,
      // but usually it rolls that attribute.
    }

    // Handle attribute rolls if needed (just attribute value d6?)
    if (dataset.rollType === "attribute") {
      const attrKey = dataset.key;
      const attribute = this.actor.system.attributes[attrKey];
      const formula = `${attribute.value + cursedDice}d6`;
      let roll = new Roll(formula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Roll ${dataset.label}`,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }

    if (dataset.rollType === "skill") {
      const skillKey = dataset.key;
      const skill = this.actor.system.skills[skillKey];
      const attributeKey = skill.mod;
      const attribute = this.actor.system.attributes[attributeKey];

      const content = await renderTemplate(
        "systems/spn-system/templates/dialog/roll-dialog.hbs",
        {
          label: dataset.label,
          attributeLabel: attributeKey.toUpperCase(), // Could localize properly if needed
          attributeValue: attribute.value,
          skillLabel: dataset.label.toUpperCase(),
          skillValue: skill.value,
        },
      );

      new Dialog(
        {
          title: dataset.label,
          content: content,
          buttons: {
            roll: {
              label: "TIRA",
              callback: (html) => {
                const modifier =
                  Number(html.find('[name="modifier"]').val()) || 0;
                const cursedDice =
                  this.actor.system.tracks.dadi_maledetti.value || 0;

                // Prepare separate pools
                const attrValue = attribute.value;
                const skillValue = skill.value;

                // Logic for modifier: Positive mod adds "Bonus" dice (Black). Negative mod reduces skill then attribute dice.
                let effectiveAttr = attrValue;
                let effectiveSkill = skillValue;
                let effectiveMod = modifier;

                if (effectiveMod < 0) {
                  let reduce = Math.abs(effectiveMod);
                  if (effectiveSkill >= reduce) {
                    effectiveSkill -= reduce;
                    reduce = 0;
                  } else {
                    reduce -= effectiveSkill;
                    effectiveSkill = 0;
                    effectiveAttr = Math.max(0, effectiveAttr - reduce);
                  }
                  effectiveMod = 0;
                }

                // Roll functions
                async function rollPool(count) {
                  if (count <= 0) return [];
                  const r = new Roll(`${count}d6`);
                  await r.evaluate();
                  return r.dice[0].results;
                }

                (async () => {
                  const attrResults = await rollPool(effectiveAttr);
                  const skillResults = await rollPool(effectiveSkill);
                  const modResults = await rollPool(effectiveMod);
                  const cursedResults = await rollPool(cursedDice);

                  // Helper to get stats
                  const getStats = (results) => ({
                    success: results.filter((d) => d.result === 6).length,
                    cursed: results.filter((d) => d.result === 1).length,
                  });

                  const attrStats = getStats(attrResults);
                  const skillStats = getStats(skillResults);
                  const modStats = getStats(modResults);
                  const cursedStats = getStats(cursedResults);

                  // Count successes
                  const allResults = [
                    ...attrResults,
                    ...skillResults,
                    ...modResults,
                    ...cursedResults,
                  ];
                  const successCount = allResults.filter(
                    (d) => d.result === 6,
                  ).length;
                  const totalCursedCount = allResults.filter(
                    (d) => d.result === 1,
                  ).length; // User said total skull count is 1 in screen, let's count all 1s or just cursed ones?
                  // Screen shows "Skull 1" in footer. Acume had "Skull 1".
                  // So total is sum of all.

                  const cardData = {
                    label: dataset.label,
                    hasAttribute: attrResults.length > 0,
                    attributeKey: attributeKey.toUpperCase(),
                    attributeDice: attrResults,
                    attributeStats: attrStats,

                    hasSkill: skillResults.length > 0,
                    skillLabel: dataset.label.toUpperCase(),
                    skillDice: skillResults,
                    skillStats: skillStats,

                    hasCursed: cursedResults.length > 0,
                    cursedDice: cursedResults,
                    cursedStats: cursedStats,

                    hasModifier: modResults.length > 0,
                    modifierDice: modResults,
                    modifierStats: modStats,

                    successCount: successCount,
                    cursedCount: totalCursedCount,
                  };

                  const html = await renderTemplate(
                    "systems/spn-system/templates/chat/roll-card.hbs",
                    cardData,
                  );

                  if (game.settings.get("core", "rollMode") !== "blind") {
                    AudioHelper.play({ src: CONFIG.sounds.dice });
                  }

                  // Store detailed dice info for reroll logic
                  const rollFlags = {
                    attrDice: attrResults,
                    skillDice: skillResults,
                    modDice: modResults,
                    cursedDice: cursedResults,
                    label: dataset.label,
                    attributeKey: attributeKey,
                    skillLabel: dataset.label,
                  };

                  ChatMessage.create({
                    user: game.user.id,
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    content: html,
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                    flags: {
                      "spn-system": {
                        rollData: rollFlags,
                      },
                    },
                  });
                })();
              },
            },
          },
          default: "roll",
          render: (html) => {
            // Removing standard buttons styling if custom button used in template
            // actually using simple Dialog button config for now, let's see if we want custom inside form.
            // The user image shows "TIRA" as a big button.
            // To match the UI exactly, we might want to hide default buttons and use the one in template or style the default one.
            // Let's rely on standard buttons but style them or use the click listener on the template button if we put one.
            // My template includes a button. Let's use that one.
          },
        },
        {
          classes: ["orbis-dialog"],
        },
      ).render(true);
      return;
    }

    if (dataset.rollType == "item") {
      const itemId = element.closest(".item").dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) return item.roll();
    }
  }
}
