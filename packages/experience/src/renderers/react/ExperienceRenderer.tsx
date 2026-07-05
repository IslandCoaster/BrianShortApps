import type { Experience } from "../../experience";

type ExperienceRendererProps = {
  experience: Experience;
  className?: string;
};

export function ExperienceRenderer({ experience, className }: ExperienceRendererProps) {
  return (
    <div className={className}>
      {experience.regions.map((region) => (
        <section data-experience-region={region.id} key={region.id}>
          <h2>{region.title}</h2>
          <ul>
            {region.items.map((item) => (
              <li data-experience-item={item.id} key={item.id}>
                <span>{item.label}</span>
                {item.description ? <strong>{item.description}</strong> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
