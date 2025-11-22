# Database Schemas

This folder contains all the database schemas exported from Supabase, in CSV format.

Use these files as a reference to understand or reconstruct the database structure.

Below, in this Markdown, you will see the schema in code. Each code snippet represents the structure of a specific table, including column names, data types, and constraints (if necessary).

### Accessories table
```plain text
create table public.accessories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  price_estimate numeric null,
  description text null,
  image text null,
  constraint accesories_pkey primary key (id)
) TABLESPACE pg_default;
```

### Alert_history table (no usada, por ahora)
```plain text
create table public.alert_history (
  id uuid not null default gen_random_uuid (),
  plant_id uuid not null default gen_random_uuid (),
  alert_type text null,
  value real null,
  created_at timestamp with time zone null default now(),
  user_id uuid null,
  constraint alert_history_pkey primary key (id),
  constraint alert_history_plant_id_fkey foreign KEY (plant_id) references plants (id),
  constraint alert_history_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

### Devices table
```plain text
create table public.devices (
  id uuid not null default gen_random_uuid (),
  serial_number text not null,
  model text null,
  location text null,
  last_connection timestamp with time zone null,
  foundation_id uuid null,
  created_at timestamp with time zone null,
  updated_at timestamp with time zone null default now(),
  constraint devices_pkey primary key (id),
  constraint devices_serial_number_key unique (serial_number)
) TABLESPACE pg_default;
```

### Donations table
```plain text
create table public.donations (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default gen_random_uuid (),
  plant_id uuid null default gen_random_uuid (),
  amount numeric null,
  created_at timestamp with time zone null default now(),
  accessory_type text null,
  constraint donations_pkey primary key (id),
  constraint donations_plant_id_fkey foreign KEY (plant_id) references plants (id) on update CASCADE on delete CASCADE,
  constraint donations_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

### Foundations table
```plain text
create table public.foundations (
  id uuid not null default gen_random_uuid (),
  name text not null,
  contact text null,
  constraint fundaciones_pkey primary key (id)
) TABLESPACE pg_default;
```

### Plant_stats table
```plain text
create table public.plant_stats (
  id uuid not null default gen_random_uuid (),
  plant_id uuid not null,
  soil_moisture real null,
  temperature real null,
  light real null,
  recorded_at timestamp with time zone null default now(),
  constraint plant_stats_pkey primary key (id),
  constraint plant_stats_plant_id_fkey foreign KEY (plant_id) references plants (id) on delete CASCADE
) TABLESPACE pg_default;
```

### Plant_status table
```plain text
create table public.plant_status (
  id uuid not null default gen_random_uuid (),
  plant_id uuid not null,
  status text null default 'healthy'::text,
  mood_index real null,
  mood_face text null,
  recorded_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint plant_status_pkey primary key (id),
  constraint plant_status_plant_id_fkey foreign KEY (plant_id) references plants (id) on delete CASCADE,
  constraint status_check check (
    (
      status = any (
        array['healthy'::text, 'bad'::text, 'recovering'::text]
      )
    )
  )
) TABLESPACE pg_default;
```

### Plants table
```plain text
create table public.plants (
  id uuid not null default gen_random_uuid (),
  name text not null,
  species text null,
  registration_date timestamp with time zone null default now(),
  user_id uuid null default gen_random_uuid (),
  foundation_id uuid null default gen_random_uuid (),
  is_adopted boolean null default false,
  device_id uuid null,
  description text null default 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas volutpat magna tempus est sodales cursus. Curabitur eu tempus dolor, sed consequat purus. Quisque sit amet urna justo.'::text,
  image text null,
  constraint plants_pkey primary key (id),
  constraint fk_device foreign KEY (device_id) references devices (id),
  constraint plants_foundation_id_fkey foreign KEY (foundation_id) references foundations (id),
  constraint plants_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;
```

### Plant_accessories table
```plain text
create table public.plants_accessories (
  id uuid not null default gen_random_uuid (),
  plant_id uuid not null,
  accessory_id uuid not null,
  quantity integer null default 1,
  created_at timestamp with time zone null default now(),
  constraint plant_accessories_pkey primary key (id),
  constraint plants_accessories_accessory_id_fkey foreign KEY (accessory_id) references accessories (id) on update CASCADE on delete CASCADE,
  constraint plants_accessories_plant_id_fkey foreign KEY (plant_id) references plants (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

### Users table
```plain text
create table public.users (
  name text not null,
  email text null,
  rol text null,
  registration_date timestamp with time zone null default now(),
  id uuid not null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;
```
