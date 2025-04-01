export type TransportationType = "Bike" | "Auto" | "Car" | "Bus" | "Unknown";

export type Post = {
  readonly _id: string;
  userId: {
    readonly _id: string;
    readonly name: string;
    readonly email: string;
    readonly gender: "male" | "female" | "other";
    readonly avatar: string;
    readonly role: "student" | "employee" | "admin";
  };
  readonly src: string;
  readonly dest: string;
  readonly via: string;
  readonly tripDate: string;
  readonly tripTime: string;
  readonly transportation: TransportationType;
  readonly notes: string;
  readonly visibleTo: string;
};