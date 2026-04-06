export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: number;
          name: string;
          x: number;
          y: number;
        };
        Insert: {
          id?: number;
          name: string;
          x: number;
          y: number;
        };
        Update: {
          id?: number;
          name?: string;
          x?: number;
          y?: number;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: number;
          location_id: number;
          status: "pending" | "in_progress" | "completed";
        };
        Insert: {
          id?: number;
          location_id: number;
          status: "pending" | "in_progress" | "completed";
        };
        Update: {
          id?: number;
          location_id?: number;
          status?: "pending" | "in_progress" | "completed";
        };
        Relationships: [
          {
            foreignKeyName: "tasks_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TaskWithLocation = {
  id: number;
  status: Database["public"]["Tables"]["tasks"]["Row"]["status"];
  location: Database["public"]["Tables"]["locations"]["Row"];
};
