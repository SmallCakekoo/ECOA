export default class AlertHistory {
  constructor(data) {
    this.id = data.id;
    this.alert_id = data.alert_id;
    this.plant_id = data.plant_id;
    this.user_id = data.user_id;
    this.action = data.action; // 'created', 'updated', 'resolved', 'dismissed'
    this.old_status = data.old_status;
    this.new_status = data.new_status;

    this.notes = data.notes;
    this.created_at = data.created_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      alert_id: this.alert_id,
      plant_id: this.plant_id,
      user_id: this.user_id,
      action: this.action,
      old_status: this.old_status,
      new_status: this.new_status,
      notes: this.notes,
      created_at: this.created_at,
    };
  }
}
