import { cn } from "@/lib/utils";
import { PANTRY_LINKS, PLANNING_LINKS, QuickLinkComponent, SectionHeader, SHOPPING_LINKS } from "./Navbar";


interface MegaMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}
const PurchasesMegaMenu = ({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: MegaMenuProps) => {
  return (
    <div
      className={cn(
        "absolute px-4 left-0 right-0 top-full bg-card border-b border-border shadow-xl transition-all duration-300 overflow-hidden",
        isOpen
          ? "opacity-100 visible max-h-[400px]"
          : "opacity-0 invisible max-h-0"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClose}
    >
      <div className="container py-6">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <SectionHeader title="Compras" />
            <div className="space-y-1">
              {SHOPPING_LINKS.slice(0, 2).map((link) => (
                <QuickLinkComponent
                  key={link.href}
                  icon={link.icon}
                  label={link.label}
                  href={link.href}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Despensa" />
            <div className="space-y-1">
              {PANTRY_LINKS.map((link) => (
                <QuickLinkComponent
                  key={link.href}
                  icon={link.icon}
                  label={link.label}
                  href={link.href}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          {/* Planificación */}
          <div>
            <SectionHeader title="Planificación" />
            <div className="space-y-1">
              {PLANNING_LINKS.map((link) => (
                <QuickLinkComponent
                  key={link.href}
                  icon={link.icon}
                  label={link.label}
                  href={link.href}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasesMegaMenu