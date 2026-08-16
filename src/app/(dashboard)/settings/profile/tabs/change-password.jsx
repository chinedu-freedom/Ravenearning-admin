"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePost } from "@/hooks/useApi";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const postChangePassword = usePost("/admin/profile/change-password");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (postChangePassword.isPending) return;

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      return;
    }

    postChangePassword.mutate(
      {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
      {
        onSuccess: () => {
          setForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  return (
    <div className="bg-white border border-gray-150 rounded-lg p-6 shadow-sm w-full md:w-1/2">
      <h2 className="text-base font-bold text-gray-800 mb-1">Password</h2>
      <p className="text-sm text-muted-foreground mb-6">
        To keep your account secure, please update your password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type={showCurrent ? "text" : "password"}
            placeholder="Current password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 pr-10 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 pr-10 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 bg-white h-10 text-gray-700 pr-10 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-blue-900">Rules for password:</p>
          <ul className="list-disc pl-5 space-y-1 text-blue-800 text-xs">
            <li>Minimum 8 characters</li>
            <li>At least one special character</li>
            <li>At least one number</li>
            <li>At least one uppercase letter</li>
            <li>Cannot be the same as a previous password</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] rounded-lg shadow-sm border-0 flex items-center justify-center gap-2 font-bold h-10"
          disabled={postChangePassword.isPending}
        >
          {postChangePassword.isPending ? "Saving" : "Save Changes"}
          {postChangePassword.isPending && (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          )}
        </Button>
      </form>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { usePost } from "@/hooks/useApi";
// import { Loader2 } from "lucide-react";

// export default function ChangePassword() {
//   const [form, setForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const postChangePassword = usePost("/api/admin/change-password");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
// toast call removed per user
//       return;
//     }
//     if (form.newPassword !== form.confirmPassword) {
// toast call removed per user
//       return;
//     }

//     postChangePassword.mutate(
//       {
//         currentPassword: form.currentPassword,
//         newPassword: form.newPassword,
//       },
//       {
//         onSuccess: (res) => {
//           // Reset form fields
//           setForm({
//             currentPassword: "",
//             newPassword: "",
//             confirmPassword: "",
//           });
//         },
//       }
//     );
//   };

//   return (
//     <div className="bg-white border rounded-md p-6 shadow-sm w-full md:w-1/2">
//       <h2 className="text-base font-medium mb-1">Password</h2>
//       <p className="text-sm text-muted-foreground mb-6">
//         To keep your account secure, please update your password below.
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           type="password"
//           placeholder="Current password"
//           name="currentPassword"
//           value={form.currentPassword}
//           onChange={handleChange}
//         />
//         <Input
//           type="password"
//           placeholder="New password"
//           name="newPassword"
//           value={form.newPassword}
//           onChange={handleChange}
//         />
//         <Input
//           type="password"
//           placeholder="Confirm password"
//           name="confirmPassword"
//           value={form.confirmPassword}
//           onChange={handleChange}
//         />

//         <div className="bg-muted/20 border rounded-md p-4 text-sm text-muted-foreground space-y-2">
//           <p className="font-medium text-foreground">Rules for password:</p>
//           <ul className="list-disc pl-5 space-y-1">
//             <li>Minimum 8 characters</li>
//             <li>At least one special character</li>
//             <li>At least one number</li>
//             <li>At least one uppercase letter</li>
//             <li>Cannot be the same as a previous password</li>
//           </ul>
//         </div>
//         <Button
//           type="submit"
//           className="mt-4 bg-[#3C3CF6] text-white hover:bg-[#2e2ee6] min-w-[140px] flex items-center justify-center gap-2"
//           disabled={postChangePassword.isPending}
//         >
//           {postChangePassword.isPending ? "Saving" : "Save Changes"}
//           {postChangePassword.isPending && (
//             <Loader2 className="w-5 h-5 animate-spin text-white" />
//           )}
//         </Button>
//       </form>
//     </div>
//   );
// }
