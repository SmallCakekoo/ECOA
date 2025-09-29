export default class RecentAction {
  constructor(data) {
    this.id = data.id;
    this.admin_id = data.admin_id;
    this.plant_id = data.plant_id;
    this.action_type = data.action_type; // 'water', 'fertilize', 'prune', 'repot', 'photo', 'measurement', 'alert'
    this.action_description = data.action_description;
    this.notes = data.notes;
    this.metadata = data.metadata; // JSON object with additional data
    this.created_at = data.created_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      admin_id: this.admin_id,
      plant_id: this.plant_id,
      action_type: this.action_type,
      action_description: this.action_description,
      notes: this.notes,
      metadata: this.metadata,
      created_at: this.created_at,
    };
  }
}
