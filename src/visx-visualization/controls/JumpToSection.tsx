import { Sort, Visibility } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import React from "react";

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

export function JumpToSection({ section }: { section: string }) {
  return (
    <Typography
      variant="subtitle1"
      display="inline-flex"
      alignItems="center"
      flexDirection="row"
      gap={1}
      py={1}
      px={2}
    >
      Jump to Section:
      <SortsLink section={section} />
      <Divider orientation="vertical" flexItem />
      <DisplayOptionsLink section={section} />
    </Typography>
  );
}
