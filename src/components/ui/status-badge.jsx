import { Badge } from "@/components/ui/badge";

export const getStatusColor = (status) => {
  if (!status) return { bg: "bg-gray-100 hover:bg-gray-200", text: "text-gray-800", dot: "bg-gray-800" };

  switch (status.toString().toLowerCase()) {
    // Success / Active states (Green)
    case "completed":
    case "active":
    case "paid":
    case "approved":
    case "success":
    case "verified":
      return { bg: "bg-blue-100 hover:bg-green-200", text: "text-green-800", dot: "bg-green-800" };

    // Processing / In Progress states (Blue)
    case "processing":
    case "shipped":
    case "in_progress":
      return { bg: "bg-blue-100 hover:bg-blue-200", text: "text-blue-800", dot: "bg-blue-800" };

    // Warning / Pending states (Yellow/Orange)
    case "pending":
    case "unverified":
    case "on_hold":
      return { bg: "bg-yellow-100 hover:bg-yellow-200", text: "text-yellow-800", dot: "bg-yellow-800" };

    // Danger / Failed states (Red)
    case "cancelled":
    case "banned":
    case "refunded":
    case "failed":
    case "rejected":
      return { bg: "bg-red-100 hover:bg-red-200", text: "text-red-800", dot: "bg-red-800" };

    default:
      return { bg: "bg-gray-100 hover:bg-gray-200", text: "text-gray-800", dot: "bg-gray-800" };
  }
};

export function StatusBadge({ status, className = "", ...props }) {
  const displayStatus = status || "Unknown";
  const colors = getStatusColor(status);
  
  // Format text to be Capitalized (e.g., "Active" instead of "ACTIVE")
  const formattedStatus = displayStatus.toString().charAt(0).toUpperCase() + displayStatus.toString().slice(1).toLowerCase();
  
  return (
    <Badge 
      variant="outline"
      className={`${colors.bg} ${colors.text} border-0 px-3 py-1 rounded-full font-bold text-[12.5px] flex items-center gap-2 w-fit ${className}`}
      {...props}
    >
      {formattedStatus}
    </Badge>
  );
}
