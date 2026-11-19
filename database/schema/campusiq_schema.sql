
CREATE TABLE announcements (
	id VARCHAR(36) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	content TEXT NOT NULL, 
	level VARCHAR(20) NOT NULL, 
	starts_at DATETIME NOT NULL, 
	expires_at DATETIME, 
	is_active BOOLEAN NOT NULL, 
	target_audience VARCHAR(50) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
)




CREATE TABLE buildings (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	description TEXT, 
	lat FLOAT NOT NULL, 
	lng FLOAT NOT NULL, 
	floors_count INTEGER NOT NULL, 
	has_elevator BOOLEAN NOT NULL, 
	has_ramp BOOLEAN NOT NULL, 
	image_url VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
)




CREATE TABLE route_history (
	id VARCHAR(36) NOT NULL, 
	start_node_id VARCHAR(36) NOT NULL, 
	end_node_id VARCHAR(36) NOT NULL, 
	origin_name VARCHAR(255), 
	destination_name VARCHAR(255), 
	total_distance_meters FLOAT NOT NULL, 
	estimated_time_minutes FLOAT NOT NULL, 
	algorithm_used VARCHAR(50) NOT NULL, 
	wheelchair_mode BOOLEAN NOT NULL, 
	avoid_stairs BOOLEAN NOT NULL, 
	calculated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
)




CREATE TABLE users (
	id VARCHAR(36) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
)




CREATE TABLE floors (
	id VARCHAR(36) NOT NULL, 
	building_id VARCHAR(36) NOT NULL, 
	floor_number INTEGER NOT NULL, 
	floor_name VARCHAR(100) NOT NULL, 
	blueprint_url VARCHAR(500), 
	is_accessible BOOLEAN NOT NULL, 
	has_restroom BOOLEAN NOT NULL, 
	has_accessible_restroom BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE CASCADE
)




CREATE TABLE locations (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	code VARCHAR(50), 
	building_id VARCHAR(36), 
	category VARCHAR(50) NOT NULL, 
	floor_number INTEGER NOT NULL, 
	room_number VARCHAR(50), 
	lat FLOAT NOT NULL, 
	lng FLOAT NOT NULL, 
	description TEXT, 
	is_accessible BOOLEAN NOT NULL, 
	tags VARCHAR(255), 
	image_url VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE SET NULL
)




CREATE TABLE path_nodes (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	node_type VARCHAR(50) NOT NULL, 
	lat FLOAT NOT NULL, 
	lng FLOAT NOT NULL, 
	elevation_meters FLOAT NOT NULL, 
	building_id VARCHAR(36), 
	floor_level INTEGER NOT NULL, 
	is_accessible BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE SET NULL
)




CREATE TABLE facilities (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	building_id VARCHAR(36), 
	location_id VARCHAR(36), 
	description TEXT, 
	contact_phone VARCHAR(50), 
	contact_email VARCHAR(100), 
	operating_hours VARCHAR(100) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE SET NULL, 
	FOREIGN KEY(location_id) REFERENCES locations (id) ON DELETE SET NULL
)




CREATE TABLE path_edges (
	id VARCHAR(36) NOT NULL, 
	start_node_id VARCHAR(36) NOT NULL, 
	end_node_id VARCHAR(36) NOT NULL, 
	distance_meters FLOAT NOT NULL, 
	pathway_type VARCHAR(50) NOT NULL, 
	is_bidirectional BOOLEAN NOT NULL, 
	is_blocked BOOLEAN NOT NULL, 
	is_wheelchair_accessible BOOLEAN NOT NULL, 
	has_stairs BOOLEAN NOT NULL, 
	has_ramp BOOLEAN NOT NULL, 
	slope_degrees FLOAT NOT NULL, 
	block_reason VARCHAR(255), 
	description TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(start_node_id) REFERENCES path_nodes (id) ON DELETE CASCADE, 
	FOREIGN KEY(end_node_id) REFERENCES path_nodes (id) ON DELETE CASCADE
)




CREATE TABLE qr_checkpoints (
	id VARCHAR(36) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	building_id VARCHAR(36), 
	floor_level INTEGER NOT NULL, 
	associated_node_id VARCHAR(36), 
	lat FLOAT NOT NULL, 
	lng FLOAT NOT NULL, 
	description TEXT, 
	orientation_guidance TEXT, 
	qr_image_url VARCHAR(500), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE SET NULL, 
	FOREIGN KEY(associated_node_id) REFERENCES path_nodes (id) ON DELETE SET NULL
)




CREATE TABLE rooms (
	id VARCHAR(36) NOT NULL, 
	floor_id VARCHAR(36) NOT NULL, 
	building_id VARCHAR(36) NOT NULL, 
	room_code VARCHAR(50) NOT NULL, 
	room_name VARCHAR(255) NOT NULL, 
	room_type VARCHAR(50) NOT NULL, 
	department VARCHAR(100), 
	capacity INTEGER NOT NULL, 
	is_accessible BOOLEAN NOT NULL, 
	description TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(floor_id) REFERENCES floors (id) ON DELETE CASCADE, 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE CASCADE
)




CREATE TABLE accessibility_features (
	id VARCHAR(36) NOT NULL, 
	building_id VARCHAR(36), 
	location_id VARCHAR(36), 
	path_edge_id VARCHAR(36), 
	feature_type VARCHAR(50) NOT NULL, 
	description TEXT, 
	is_operational BOOLEAN NOT NULL, 
	verified BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(building_id) REFERENCES buildings (id) ON DELETE CASCADE, 
	FOREIGN KEY(location_id) REFERENCES locations (id) ON DELETE CASCADE, 
	FOREIGN KEY(path_edge_id) REFERENCES path_edges (id) ON DELETE CASCADE
)




CREATE TABLE facility_statuses (
	id VARCHAR(36) NOT NULL, 
	facility_id VARCHAR(36) NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	open_time VARCHAR(20), 
	close_time VARCHAR(20), 
	days_active VARCHAR(100) NOT NULL, 
	notice VARCHAR(255), 
	updated_by VARCHAR(255), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (facility_id), 
	FOREIGN KEY(facility_id) REFERENCES facilities (id) ON DELETE CASCADE
)




CREATE TABLE incident_reports (
	id VARCHAR(36) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	location_id VARCHAR(36), 
	path_edge_id VARCHAR(36), 
	lat FLOAT, 
	lng FLOAT, 
	status VARCHAR(50) NOT NULL, 
	priority VARCHAR(20) NOT NULL, 
	reporter_name VARCHAR(100), 
	reporter_email VARCHAR(100), 
	photo_url VARCHAR(500), 
	admin_notes TEXT, 
	resolved_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(location_id) REFERENCES locations (id) ON DELETE SET NULL, 
	FOREIGN KEY(path_edge_id) REFERENCES path_edges (id) ON DELETE SET NULL
)

