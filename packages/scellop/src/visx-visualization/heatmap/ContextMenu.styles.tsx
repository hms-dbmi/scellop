import * as ContextMenu from "@radix-ui/react-context-menu";

import { styled, Theme } from "@mui/material/styles";
import { CSSProperties } from "@mui/material/styles/createMixins";
import { ComponentType, PropsWithChildren } from "react";

const ContentStyles = ({ theme }: { theme: Theme }) => {
  return {
    fontFamily: theme.typography.body1.fontFamily,
    zIndex: theme.zIndex.tooltip,
    minWidth: "220px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    padding: theme.spacing(0.5),
    boxShadow: theme.shadows[2],
  } as CSSProperties;
};

export const ContextMenuContent = styled(ContextMenu.Content)(
  ContentStyles,
) as unknown as typeof ContextMenu.Content;

export const ContextMenuSubContent = styled(ContextMenu.SubContent)(
  ContentStyles,
) as unknown as typeof ContextMenu.SubContent;

const ItemStyles = ({ theme }: { theme: Theme }) =>
  ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1,
    color: theme.palette.text.primary,
    borderRadius: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    height: theme.spacing(3),
    padding: theme.spacing(0, 0.5),
    position: "relative",
    paddingLeft: theme.spacing(3),
    userSelect: "none",
    outline: "none",
    "&[data-disabled]": {
      color: theme.palette.text.disabled,
      pointerEvents: "none",
      "> .RightSlot": {
        color: theme.palette.text.disabled,
      },
    },
    '&[data-state="open"]': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    "&[data-highlighted]": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "> .RightSlot": {
        color: theme.palette.primary.contrastText,
      },
    },
  }) as CSSProperties;

export const ContextMenuItem = styled(ContextMenu.Item)(
  ItemStyles,
) as unknown as typeof ContextMenu.Item;
export const ContextMenuCheckboxItem = styled(ContextMenu.CheckboxItem)(
  ItemStyles,
) as unknown as typeof ContextMenu.CheckboxItem;
export const ContextMenuRadioItem = styled(ContextMenu.RadioItem)(
  ItemStyles,
) as unknown as typeof ContextMenu.RadioItem;
export const ContextMenuSubTrigger = styled(ContextMenu.SubTrigger)(
  ItemStyles,
) as unknown as typeof ContextMenu.SubTrigger;

export const RightSlot = styled("div")(({ theme }) => ({
  marginLeft: "auto",
  paddingLeft: theme.spacing(2.5),
  color: theme.palette.text.secondary,
})) as unknown as ComponentType<PropsWithChildren>;

export const ContextMenuLabel = styled(ContextMenu.Label)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  fontSize: theme.typography.body1.fontSize,
  lineHeight: theme.spacing(3),
  color: theme.palette.primary.dark,
  userSelect: "none",
})) as unknown as typeof ContextMenu.Label;

export const ContextMenuSeparator = styled(ContextMenu.Separator)(
  ({ theme }) => ({
    height: "1px",
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(0.5, 0),
  }),
) as unknown as typeof ContextMenu.Separator;

export const ContextMenuItemIndicator = styled(ContextMenu.ItemIndicator)(
  ({ theme }) => ({
    position: "absolute",
    left: 0,
    width: theme.spacing(3),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }),
) as unknown as typeof ContextMenu.ItemIndicator;
