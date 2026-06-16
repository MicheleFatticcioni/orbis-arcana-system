export const DEFAULT_WEAPONS = [
  {
    name: "Pistola semi automatica",
    type: "firearm",
    range_meters: "5-20",
    damage: 1,
    ammo: { value: 15, max: 15, reserve: 30 },
    cost_euro: 300,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Revolver",
    type: "firearm",
    range_meters: "5-15",
    damage: 2,
    ammo: { value: 6, max: 6, reserve: 18 },
    cost_euro: 450,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Fucile a pompa",
    type: "firearm",
    range_meters: "5-15",
    damage: 3,
    ammo: { value: 2, max: 2, reserve: 10 },
    cost_euro: 600,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Fucile da caccia",
    type: "firearm",
    range_meters: "5-30",
    damage: 2,
    ammo: { value: 2, max: 2, reserve: 10 },
    cost_euro: 350,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Carabina",
    type: "firearm",
    range_meters: "5-40",
    damage: 2,
    ammo: { value: 10, max: 10, reserve: 20 },
    cost_euro: 700,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Coltello",
    type: "melee",
    range_meters: "Engaged",
    damage: 1,
    ammo: { value: 0, max: 0, reserve: 0 },
    cost_euro: 20,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Spranga",
    type: "melee",
    range_meters: "Engaged",
    damage: 2,
    ammo: { value: 0, max: 0, reserve: 0 },
    cost_euro: 0,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Mazza da baseball",
    type: "melee",
    range_meters: "Engaged",
    damage: 2,
    ammo: { value: 0, max: 0, reserve: 0 },
    cost_euro: 30,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Accetta",
    type: "melee",
    range_meters: "Engaged",
    damage: 2,
    ammo: { value: 0, max: 0, reserve: 0 },
    cost_euro: 40,
    health_status: { value: 5, min: 0, max: 5 }
  },
  {
    name: "Machete",
    type: "melee",
    range_meters: "Engaged",
    damage: 3,
    ammo: { value: 0, max: 0, reserve: 0 },
    cost_euro: 60,
    health_status: { value: 5, min: 0, max: 5 }
  }
];
