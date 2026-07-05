import type { Experience } from "../../experience";

type ExperienceRendererProps = {
  experience: Experience;
  className?: string;
  onSelectItem?: (itemId: string) => void;
  selectedItemId?: string | null;
};

export function ExperienceRenderer({
  experience,
  className,
  onSelectItem,
  selectedItemId,
}: ExperienceRendererProps) {
  return (
    <div className={className}>
      {experience.regions.map((region) => (
        <section data-experience-region={region.id} key={region.id}>
          <h2>{region.title}</h2>
          <ul>
            {region.items.map((item) => (
              <li
                data-experience-item={item.id}
                data-selected={item.id === selectedItemId ? "true" : "false"}
                key={item.id}
              >
                <button type="button" onClick={() => onSelectItem?.(item.id)}>
                  <span>{item.label}</span>
                  {item.description ? <strong>{item.description}</strong> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
