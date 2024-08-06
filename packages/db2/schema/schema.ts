import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, unique, int, datetime, mysqlEnum, double, varchar, text, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const Admin = mysqlTable("Admin", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	userId: int("userId").notNull(),
},
(table) => {
	return {
		userId: index("userId").on(table.userId),
		Admin_id_pk: primaryKey({ columns: [table.id], name: "Admin_id_pk"}),
		Admin_userId_key: unique("Admin_userId_key").on(table.userId),
	}
});

export const Appointment = mysqlTable("Appointment", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	doctorId: int("doctorId").notNull(),
	patientId: int("patientId").notNull(),
	serialNo: int("serialNo").default(0).notNull(),
	type: mysqlEnum("type", ['IN_PERSON','ONLINE']).default('IN_PERSON').notNull(),
	status: mysqlEnum("status", ['PENDING','CONFIRMED','CANCELLED','COMPLETED']).default('PENDING').notNull(),
	purpose: mysqlEnum("purpose", ['CONSULTATION','FOLLOW_UP','SHOW_REPORT']).default('CONSULTATION').notNull(),
	fee: double("fee").notNull(),
	date: datetime("date", { mode: 'string', fsp: 3 }).notNull(),
	time: varchar("time", { length: 191 }).notNull(),
	location: varchar("location", { length: 191 }),
	bookedBy: mysqlEnum("bookedBy", ['ANONYMOUS','PATIENT','DOCTOR','ADMIN','SUPER_ADMIN']).default('PATIENT').notNull(),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		patientId: index("patientId").on(table.patientId),
		Appointment_id_pk: primaryKey({ columns: [table.id], name: "Appointment_id_pk"}),
	}
});

export const Doctor = mysqlTable("Doctor", {
	id: int("id").autoincrement().notNull(),
	secondId: varchar("secondId", { length: 191 }).notNull(),
	slug: varchar("slug", { length: 120 }).notNull(),
	userId: int("userId").notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	bio: text("bio").notNull(),
	verified: tinyint("verified").default(0).notNull(),
},
(table) => {
	return {
		slug: index("slug").on(table.slug),
		Doctor_id_pk: primaryKey({ columns: [table.id], name: "Doctor_id_pk"}),
		Doctor_secondId_key: unique("Doctor_secondId_key").on(table.secondId),
		Doctor_slug_key: unique("Doctor_slug_key").on(table.slug),
		Doctor_userId_key: unique("Doctor_userId_key").on(table.userId),
	}
});

export const DoctorAdmin = mysqlTable("DoctorAdmin", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	doctorId: int("doctorId").notNull(),
	adminId: int("adminId").notNull(),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		adminId: index("adminId").on(table.adminId),
		DoctorAdmin_id_pk: primaryKey({ columns: [table.id], name: "DoctorAdmin_id_pk"}),
	}
});

export const DoctorAvailability = mysqlTable("DoctorAvailability", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	doctorId: int("doctorId").notNull(),
	dayOfWeek: mysqlEnum("dayOfWeek", ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).notNull(),
	metadataId: int("metadataId").notNull(),
	startHour: varchar("startHour", { length: 191 }).notNull(),
	endHour: varchar("endHour", { length: 191 }).notNull(),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		metadataId: index("metadataId").on(table.metadataId),
		DoctorAvailability_id_pk: primaryKey({ columns: [table.id], name: "DoctorAvailability_id_pk"}),
	}
});

export const DoctorMetadata = mysqlTable("DoctorMetadata", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	doctorId: int("doctorId").notNull(),
	location: varchar("location", { length: 191 }).notNull(),
	consultationFee: double("consultationFee").notNull(),
	followUpFee: double("followUpFee").notNull(),
	showReportFee: double("showReportFee").notNull(),
	followUpFeeValidity: int("followUpFeeValidity"),
	showReportFeeValidity: int("showReportFeeValidity"),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		DoctorMetadata_id_pk: primaryKey({ columns: [table.id], name: "DoctorMetadata_id_pk"}),
	}
});

export const DoctorQualification = mysqlTable("DoctorQualification", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	doctorId: int("doctorId").notNull(),
	name: varchar("name", { length: 191 }).notNull(),
	degree: varchar("degree", { length: 191 }).notNull(),
	institute: varchar("institute", { length: 191 }).notNull(),
	year: int("year").notNull(),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		DoctorQualification_id_pk: primaryKey({ columns: [table.id], name: "DoctorQualification_id_pk"}),
	}
});

export const DoctorSpeciality = mysqlTable("DoctorSpeciality", {
	doctorId: int("doctorId").notNull(),
	specialityId: int("specialityId").notNull(),
	isPrimary: tinyint("isPrimary").default(0).notNull(),
},
(table) => {
	return {
		doctorId: index("doctorId").on(table.doctorId),
		specialityId: index("specialityId").on(table.specialityId),
		DoctorSpeciality_doctorId_specialityId_pk: primaryKey({ columns: [table.doctorId, table.specialityId], name: "DoctorSpeciality_doctorId_specialityId_pk"}),
	}
});

export const Medicine = mysqlTable("Medicine", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 191 }).notNull(),
	dosage: varchar("dosage", { length: 191 }).notNull(),
	remarks: varchar("remarks", { length: 191 }),
	prescriptionId: int("prescriptionId").notNull(),
},
(table) => {
	return {
		prescriptionId_idx: index("Medicine_prescriptionId_idx").on(table.prescriptionId),
		Medicine_id_pk: primaryKey({ columns: [table.id], name: "Medicine_id_pk"}),
	}
});

export const Organization = mysqlTable("Organization", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	name: varchar("name", { length: 191 }).notNull(),
	slug: varchar("slug", { length: 191 }).notNull(),
},
(table) => {
	return {
		slug: index("slug").on(table.slug),
		Organization_id_pk: primaryKey({ columns: [table.id], name: "Organization_id_pk"}),
		Organization_slug_key: unique("Organization_slug_key").on(table.slug),
	}
});

export const OrganizationAdmin = mysqlTable("OrganizationAdmin", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	organizationId: int("organizationId").notNull(),
	adminId: int("adminId").notNull(),
},
(table) => {
	return {
		organizationId: index("organizationId").on(table.organizationId),
		adminId: index("adminId").on(table.adminId),
		OrganizationAdmin_id_pk: primaryKey({ columns: [table.id], name: "OrganizationAdmin_id_pk"}),
	}
});

export const OrganizationDoctor = mysqlTable("OrganizationDoctor", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	organizationId: int("organizationId").notNull(),
	doctorId: int("doctorId").notNull(),
},
(table) => {
	return {
		organizationId: index("organizationId").on(table.organizationId),
		doctorId: index("doctorId").on(table.doctorId),
		OrganizationDoctor_id_pk: primaryKey({ columns: [table.id], name: "OrganizationDoctor_id_pk"}),
	}
});

export const OrganizationPatient = mysqlTable("OrganizationPatient", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	organizationId: int("organizationId").notNull(),
	patientId: int("patientId").notNull(),
},
(table) => {
	return {
		organizationId: index("organizationId").on(table.organizationId),
		patientId: index("patientId").on(table.patientId),
		OrganizationPatient_id_pk: primaryKey({ columns: [table.id], name: "OrganizationPatient_id_pk"}),
	}
});

export const Patient = mysqlTable("Patient", {
	id: int("id").autoincrement().notNull(),
	secondId: varchar("secondId", { length: 191 }).notNull(),
	userId: int("userId").notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
},
(table) => {
	return {
		Patient_id_pk: primaryKey({ columns: [table.id], name: "Patient_id_pk"}),
		Patient_secondId_key: unique("Patient_secondId_key").on(table.secondId),
		Patient_userId_key: unique("Patient_userId_key").on(table.userId),
	}
});

export const Prescription = mysqlTable("Prescription", {
	id: int("id").autoincrement().notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	complaint: varchar("complaint", { length: 191 }).notNull(),
	diagnosis: varchar("diagnosis", { length: 191 }),
	followUp: datetime("followUp", { mode: 'string', fsp: 3 }),
	advice: varchar("advice", { length: 191 }),
	appointmentId: int("appointmentId").notNull(),
	patientId: int("patientId").notNull(),
	doctorId: int("doctorId").notNull(),
},
(table) => {
	return {
		appointmentId_idx: index("Prescription_appointmentId_idx").on(table.appointmentId),
		patientId_idx: index("Prescription_patientId_idx").on(table.patientId),
		doctorId_idx: index("Prescription_doctorId_idx").on(table.doctorId),
		Prescription_id_pk: primaryKey({ columns: [table.id], name: "Prescription_id_pk"}),
		Prescription_appointmentId_key: unique("Prescription_appointmentId_key").on(table.appointmentId),
	}
});

export const Speciality = mysqlTable("Speciality", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 191 }).notNull(),
	slug: varchar("slug", { length: 191 }).notNull(),
},
(table) => {
	return {
		Speciality_id_pk: primaryKey({ columns: [table.id], name: "Speciality_id_pk"}),
		Speciality_name_key: unique("Speciality_name_key").on(table.name),
		Speciality_slug_key: unique("Speciality_slug_key").on(table.slug),
	}
});

export const User = mysqlTable("User", {
	id: int("id").autoincrement().notNull(),
	secondId: varchar("secondId", { length: 191 }).notNull(),
	createdAt: datetime("createdAt", { mode: 'string', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updatedAt", { mode: 'string', fsp: 3 }).notNull(),
	email: varchar("email", { length: 191 }),
	dateOfBirth: datetime("dateOfBirth", { mode: 'string', fsp: 3 }),
	gender: mysqlEnum("gender", ['MALE','FEMALE','OTHER']).default('MALE').notNull(),
	role: mysqlEnum("role", ['ANONYMOUS','PATIENT','DOCTOR','ADMIN','SUPER_ADMIN']).default('ANONYMOUS').notNull(),
	firebaseId: varchar("firebaseId", { length: 191 }).default('').notNull(),
	name: varchar("name", { length: 191 }),
	onboarding: mysqlEnum("onboarding", ['NOT_STARTED','IN_PROGRESS','COMPLETED']).default('NOT_STARTED').notNull(),
	phone: varchar("phone", { length: 191 }),
	image: varchar("image", { length: 191 }),
},
(table) => {
	return {
		secondId: index("secondId").on(table.secondId),
		firebaseId: index("firebaseId").on(table.firebaseId),
		phone: index("phone").on(table.phone),
		role: index("role").on(table.role),
		User_id_pk: primaryKey({ columns: [table.id], name: "User_id_pk"}),
		User_secondId_key: unique("User_secondId_key").on(table.secondId),
	}
});