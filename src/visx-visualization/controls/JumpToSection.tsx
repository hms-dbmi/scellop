import { Sort, Visibility } from "@mui/icons-material";
import { Link, Typography } from "@mui/material";
import React from "react";
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
      <Link
        href={`#sort-options-${section}`}
        display="flex"
        alignItems="center"
        underline="none"
        gap={1}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(`sort-options-${section}`)?.scrollIntoView({
            behavior: "smooth",
          });
        }}
      >
        <Sort /> Sorts
      </Link>
      {" | "}
      <Link
        href={`#display-options-${section}`}
        display="flex"
        alignItems="center"
        underline="none"
        gap={1}
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById(`display-options-${section}`)
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }}
      >
        <Visibility /> Display Options
      </Link>
    </Typography>
  );
}
