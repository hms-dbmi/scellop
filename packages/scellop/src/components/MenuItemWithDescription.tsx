import { MenuItem, MenuItemOwnProps, Stack, Typography } from "@mui/material";
import React, { forwardRef } from "react";

interface MenuItemWithDescriptionProps extends MenuItemOwnProps {
  value: string | number;
  title: string;
  description: string;
}

const MenuItemWithDescription = forwardRef(function MenuItemWithDescription(
  { value, title, description, ...rest }: MenuItemWithDescriptionProps,
  ref: React.Ref<HTMLLIElement>,
) {
  return (
    <MenuItem value={value} ref={ref} {...rest}>
      <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.75rem",
            textTransform: "none",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.3,
            maxWidth: "100%",
          }}
        >
          {description}
        </Typography>
      </Stack>
    </MenuItem>
  );
});

export default MenuItemWithDescription;
