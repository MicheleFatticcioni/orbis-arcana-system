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
    // Enrich Inventory (Zaino)
    context.enrichedInventory = await TextEditor.enrichHTML(
      this.actor.system.inventory.value,
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

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.img) {
      // Just showing an image/modal? No standard roll behavior described for clicking attribute box just to show value,
      // but usually it rolls that attribute.
    }

    if (dataset.rollType === "skill") {
      const skillKey = dataset.key;
      const skill = this.actor.system.skills[skillKey];
      const attributeKey = skill.mod;
      const attribute = this.actor.system.attributes[attributeKey];
      const cursedDice = this.actor.system.tracks.dadi_maledetti.value || 0;

      // Formula: (Attribute + Skill) d6
      const diceCount = attribute.value + skill.value;
      let formula = `${diceCount}d6`;

      let label = `Roll ${dataset.label} (${attributeKey} + ${skillKey})`;

      // Simple roll for now.
      // If we want to integrate cursed dice mechanically, we'd add them to the pool or roll separately.
      // The req says: "tenendo conto dei dadi Maledetti (cliccando sul nome dell'abilità)."
      // Let's prompt or just add them to the flavor text for manual resolution if not specified.
      // Assuming we just roll the pool.

      // If cursed dice > 0, maybe we should roll different colored dice or just note it.
      // For this task, I'll just roll the pool.

      let roll = new Roll(formula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor:
          label +
          (cursedDice > 0 ? `<br><b>Dadi Maledetti: ${cursedDice}</b>` : ""),
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }

    // Handle attribute rolls if needed (just attribute value d6?)
    if (dataset.rollType === "attribute") {
      const attrKey = dataset.key;
      const attribute = this.actor.system.attributes[attrKey];
      const formula = `${attribute.value}d6`;
      let roll = new Roll(formula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Roll ${dataset.label}`,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }

    if (dataset.rollType == "item") {
      const itemId = element.closest(".item").dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) return item.roll();
    }
  }
}
