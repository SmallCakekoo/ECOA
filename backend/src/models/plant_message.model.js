export default class PlantMessage {
  constructor(data) {
    this.id = data.id;
    this.plant_id = data.plant_id;
    this.user_id = data.user_id;
    this.message = data.message;
    this.message_type = data.message_type; // 'text', 'image', 'video', 'audio'
    this.media_url = data.media_url;
    this.sender_type = data.sender_type; // 'user', 'system', 'ai'
    this.read = data.read || false;
    this.read_at = data.read_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      plant_id: this.plant_id,
      user_id: this.user_id,
      message: this.message,
      message_type: this.message_type,
      media_url: this.media_url,
      sender_type: this.sender_type,
      read: this.read,
      read_at: this.read_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
