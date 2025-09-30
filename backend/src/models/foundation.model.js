export default class Foundation {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.website = data.website;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.country = data.country;
    this.logo_url = data.logo_url;
    this.verified = data.verified || false;
    this.active = data.active || true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      website: this.website,
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      country: this.country,
      logo_url: this.logo_url,
      verified: this.verified,
      active: this.active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
