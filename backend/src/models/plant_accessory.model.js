export default class PlantAccessory {
  constructor(data) {
    this.id = data.id;
    this.plant_id = data.plant_id;
    this.accessory_id = data.accessory_id;
    this.quantity = data.quantity || 1;
    this.created_at = data.created_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      plant_id: this.plant_id,
      accessory_id: this.accessory_id,
      quantity: this.quantity,
      created_at: this.created_at,
    };
  }
}
