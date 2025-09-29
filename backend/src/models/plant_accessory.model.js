export default class PlantAccessory {
  constructor(data) {
    this.id = data.id;
    this.plant_id = data.plant_id;
    this.accessory_id = data.accessory_id;
    this.assigned_at = data.assigned_at;
    this.assigned_by = data.assigned_by;
    this.notes = data.notes;
    this.active = data.active || true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      plant_id: this.plant_id,
      accessory_id: this.accessory_id,
      assigned_at: this.assigned_at,
      assigned_by: this.assigned_by,
      notes: this.notes,
      active: this.active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
