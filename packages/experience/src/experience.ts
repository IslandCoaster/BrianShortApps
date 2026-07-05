export type ExperienceItemStatus = "active" | "available" | "planned";

export interface Experience {
  id: string;
  title: string;
  description: string;
  sections: ExperienceSection[];
}

export interface ExperienceSection {
  id: string;
  title: string;
  items: ExperienceItem[];
}

export interface ExperienceItem {
  id: string;
  label: string;
  description?: string;
  status?: ExperienceItemStatus;
}
