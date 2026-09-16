import { Sort, Visibility } from "@mui/icons-material";
import Button from "@mui/material/Button";

function scrollToSection(section: string) {
  document.getElementById(section)?.scrollIntoView({
    behavior: "smooth",
  });
}

export function SortsLink({ section }: { section: string }) {
  return (
    <Button
      href={`#sort-options-${section}`}
      startIcon={<Sort />}
      variant="text"
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(`sort-options-${section}`);
      }}
    >
      Sorts
    </Button>
  );
}

export function DisplayOptionsLink({ section }: { section: string }) {
  return (
    <Button
      href={`#display-options-${section}`}
      startIcon={<Visibility />}
      variant="text"
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(`display-options-${section}`);
      }}
    >
      Display Options
    </Button>
  );
}
