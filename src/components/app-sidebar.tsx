import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Brain,
  Briefcase,
  Code2,
  FolderKanban,
  Sparkles,
  GraduationCap,
  Star,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Study",
    items: [
      { title: "Academics", url: "/academics", icon: BookOpen },
      { title: "Exams", url: "/exams", icon: ClipboardCheck },
      { title: "Aptitude", url: "/aptitude", icon: Brain },
      { title: "Coding", url: "/coding", icon: Code2 },
    ],
  },
  {
    label: "Placement",
    items: [
      { title: "Placements", url: "/placements", icon: Briefcase },
      { title: "Projects", url: "/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "AI Assistant", url: "/ai-assistant", icon: Sparkles },
      { title: "Daily Growth Hub", url: "/daily-growth", icon: Star },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-sm">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">Gradus</span>
            <span className="truncate text-[11px] text-muted-foreground">
              Academic & Placement
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="group/menu-item relative h-9 rounded-md font-medium data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15"
                      >
                        <Link to={item.url} className="flex items-center gap-2.5">
                          {active && (
                            <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary" />
                          )}
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
