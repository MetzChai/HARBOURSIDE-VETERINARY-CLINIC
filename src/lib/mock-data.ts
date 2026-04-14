// Mock data for the veterinary clinic system

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: "Male" | "Female";
  dob: string;
  ownerId: string;
  imageUrl?: string;
}

export interface Owner {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  date: string;
  time: string;
  vet: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Missed" | "Cancelled";
}

export interface Vaccination {
  id: string;
  petId: string;
  petName: string;
  vaccineType: string;
  dateGiven: string;
  nextDue: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  vaccineName: string;
  quantity: number;
  expirationDate: string;
  status: "Available" | "Low Stock" | "Expired";
}

export interface Checkup {
  id: string;
  petId: string;
  date: string;
  vet: string;
  diagnosis: string;
}

export interface Treatment {
  id: string;
  petId: string;
  treatment: string;
  date: string;
  notes: string;
}

export const mockOwners: Owner[] = [
  { id: "o1", name: "Maria Santos", contact: "09171234567", email: "maria@email.com", address: "123 Harbour St, Manila" },
  { id: "o2", name: "Juan Dela Cruz", contact: "09189876543", email: "juan@email.com", address: "456 Seaside Ave, Cebu" },
  { id: "o3", name: "Ana Reyes", contact: "09201112233", email: "ana@email.com", address: "789 Ocean Blvd, Davao" },
  { id: "o4", name: "Carlos Garcia", contact: "09321234567", email: "carlos@email.com", address: "321 Bay Rd, Iloilo" },
];

export const mockPets: Pet[] = [
  { id: "p1", name: "Max", species: "Dog", breed: "Golden Retriever", gender: "Male", dob: "2021-03-15", ownerId: "o1" },
  { id: "p2", name: "Whiskers", species: "Cat", breed: "Persian", gender: "Female", dob: "2022-07-20", ownerId: "o1" },
  { id: "p3", name: "Buddy", species: "Dog", breed: "Labrador", gender: "Male", dob: "2020-11-05", ownerId: "o2" },
  { id: "p4", name: "Luna", species: "Cat", breed: "Siamese", gender: "Female", dob: "2023-01-10", ownerId: "o3" },
  { id: "p5", name: "Rocky", species: "Dog", breed: "Bulldog", gender: "Male", dob: "2019-08-22", ownerId: "o4" },
];

export const mockAppointments: Appointment[] = [
  { id: "a1", petId: "p1", petName: "Max", ownerName: "Maria Santos", date: "2026-03-24", time: "09:00", vet: "Dr. Rivera", reason: "Annual check-up", status: "Scheduled" },
  { id: "a2", petId: "p3", petName: "Buddy", ownerName: "Juan Dela Cruz", date: "2026-03-24", time: "10:30", vet: "Dr. Tan", reason: "Vaccination", status: "Scheduled" },
  { id: "a3", petId: "p4", petName: "Luna", ownerName: "Ana Reyes", date: "2026-03-24", time: "14:00", vet: "Dr. Rivera", reason: "Skin allergy", status: "Completed" },
  { id: "a4", petId: "p2", petName: "Whiskers", ownerName: "Maria Santos", date: "2026-03-25", time: "11:00", vet: "Dr. Tan", reason: "Dental cleaning", status: "Scheduled" },
];

export const mockVaccinations: Vaccination[] = [
  { id: "v1", petId: "p1", petName: "Max", vaccineType: "Rabies", dateGiven: "2025-09-15", nextDue: "2026-09-15", notes: "Annual booster" },
  { id: "v2", petId: "p1", petName: "Max", vaccineType: "DHPP", dateGiven: "2025-09-15", nextDue: "2026-09-15", notes: "" },
  { id: "v3", petId: "p3", petName: "Buddy", vaccineType: "Rabies", dateGiven: "2025-06-10", nextDue: "2026-03-25", notes: "Due soon" },
  { id: "v4", petId: "p4", petName: "Luna", vaccineType: "FVRCP", dateGiven: "2025-12-01", nextDue: "2026-12-01", notes: "" },
  { id: "v5", petId: "p5", petName: "Rocky", vaccineType: "Rabies", dateGiven: "2025-01-20", nextDue: "2026-01-20", notes: "Overdue" },
];

export const mockInventory: InventoryItem[] = [
  { id: "i1", vaccineName: "Rabies", quantity: 25, expirationDate: "2027-06-15", status: "Available" },
  { id: "i2", vaccineName: "DHPP", quantity: 5, expirationDate: "2026-12-01", status: "Low Stock" },
  { id: "i3", vaccineName: "FVRCP", quantity: 18, expirationDate: "2027-03-20", status: "Available" },
  { id: "i4", vaccineName: "Bordetella", quantity: 0, expirationDate: "2026-01-15", status: "Expired" },
  { id: "i5", vaccineName: "Leptospirosis", quantity: 3, expirationDate: "2026-09-30", status: "Low Stock" },
];

export const mockCheckups: Checkup[] = [
  { id: "c1", petId: "p1", date: "2025-09-15", vet: "Dr. Rivera", diagnosis: "Healthy, no concerns" },
  { id: "c2", petId: "p1", date: "2025-03-10", vet: "Dr. Tan", diagnosis: "Minor ear infection" },
  { id: "c3", petId: "p3", date: "2025-06-10", vet: "Dr. Rivera", diagnosis: "Overweight, diet recommended" },
];

export const mockTreatments: Treatment[] = [
  { id: "t1", petId: "p1", treatment: "Ear drops", date: "2025-03-10", notes: "Apply twice daily for 7 days" },
  { id: "t2", petId: "p3", treatment: "Weight management plan", date: "2025-06-10", notes: "Reduce food by 20%, increase walks" },
  { id: "t3", petId: "p5", treatment: "Skin medication", date: "2025-11-05", notes: "Topical cream for dermatitis" },
];

export const getOwnerById = (id: string) => mockOwners.find(o => o.id === id);
export const getPetsByOwner = (ownerId: string) => mockPets.filter(p => p.ownerId === ownerId);
export const getVaccinationsByPet = (petId: string) => mockVaccinations.filter(v => v.petId === petId);
export const getCheckupsByPet = (petId: string) => mockCheckups.filter(c => c.petId === petId);
export const getTreatmentsByPet = (petId: string) => mockTreatments.filter(t => t.petId === petId);
