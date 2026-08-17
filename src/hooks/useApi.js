"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchData,
  postData,
  updateData,
  patchData,
  deleteData,
} from "@/config/apiHelpers";
import { toast } from "sonner";

// Centralized error formatter
const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors && Array.isArray(data.errors)) return data.errors.join(", ");
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return error?.message || "Something went wrong. Please try again.";
};

// Normalize query key
const handleQueryKey = (queryKey) => {
  return Array.isArray(queryKey) ? queryKey : [queryKey];
};

/* ================= GET ================= */
export const useFetchData = (endpoint, queryKey, options = {}) => {
  return useQuery({
    queryKey: handleQueryKey(queryKey || endpoint),

    queryFn: async ({ signal }) => {
      const res = await fetchData(endpoint, { signal });

      if (res && !Array.isArray(res) && res.success === false) {
        throw new Error(res?.message || "Failed to fetch data");
      }

      return res;
    },

    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled ?? true,

    retry: (failureCount, error) => {
      if (error?.name === "CanceledError") return false;

      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) return false;

      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },

    onError: (error) => {
      if (error?.name === "CanceledError") return;
      toast.error(getErrorMessage(error));
    },
  });
};

/* ================= SUCCESS MESSAGE MAPPER ================= */
const getSuccessMessage = (method, endpoint, res) => {
  if (res?.message && !["Request successful", "Updated successfully", "Deleted successfully", "Success", "Request completed successfully"].includes(res.message)) {
    return res.message;
  }
  
  const path = typeof endpoint === "function" ? endpoint("") : endpoint;
  
  if (method === "POST") {
    if (path.includes("/auth/admin/login") || path.includes("/auth/login")) return "Logged in successfully!";
    if (path.includes("/auth/admin/forgot-password") || path.includes("/auth/forgot-password")) return "OTP sent successfully!";
    if (path.includes("/auth/admin/verify-otp") || path.includes("/auth/verify-otp")) return "OTP verified successfully!";
    if (path.includes("/auth/admin/reset-password") || path.includes("/auth/reset-password")) return "Password reset successfully!";
    if (path.includes("/admin/rewards/tasks")) return "Task reward created successfully!";
    if (path.includes("/admin/rewards/spin-prizes")) return "Spin prize created successfully!";
    if (path.includes("/admin/plans")) return "Investment plan created successfully!";
    if (path.includes("/admin/news")) return "News article created successfully!";
    if (path.includes("/admin/partners")) return "Partner created successfully!";
    if (path.includes("/admin/live-market")) return "Live market asset created successfully!";
    if (path.includes("/admin/rewards/gift-codes")) return "Gift code created successfully!";
    if (path.includes("/admin/sliders")) return "Slider image added successfully!";
    if (path.includes("/admin/profile/change-password")) return "Password updated successfully!";
    if (path.includes("/admin/settings/payout-cryptos")) return "Payout cryptocurrency added successfully!";
    if (path.includes("/admin/countries/update-rates")) return "Exchange rates updated successfully!";
    if (path.includes("/admin/countries")) return "Country added successfully!";
    if (path.includes("/admin/languages")) return "Language added successfully!";
    return "Request successful!";
  }
  
  if (method === "PUT" || method === "PATCH") {
    if (path.includes("/admin/rewards/gift-codes")) return "Gift code updated successfully!";
    if (path.includes("/admin/live-market")) return "Live market asset updated successfully!";
    if (path.includes("/admin/partners")) return "Partner updated successfully!";
    if (path.includes("/admin/sliders")) return "Slider updated successfully!";
    if (path.includes("/admin/rewards/spin-prizes")) return "Spin prize updated successfully!";
    if (path.includes("/admin/rewards/spin-settings")) return "Spin settings updated successfully!";
    if (path.includes("/admin/rewards/tasks")) return "Task reward updated successfully!";
    if (path.includes("/admin/plans")) return "Investment plan updated successfully!";
    if (path.includes("/admin/news")) return "News article updated successfully!";
    if (path.includes("/admin/settings/platform")) return "Platform settings updated successfully!";
    if (path.includes("/admin/settings/email")) return "Email settings updated successfully!";
    if (path.includes("/admin/settings/payout-cryptos")) return "Payout cryptocurrency updated successfully!";
    if (path.includes("/admin/about/banners")) return "About banner updated successfully!";
    if (path.includes("/admin/about/team-members")) return "Team member updated successfully!";
    if (path.includes("/admin/countries")) return "Country updated successfully!";
    if (path.includes("/admin/languages")) return "Language updated successfully!";
    if (path.includes("/admin/profile")) return "Profile updated successfully!";
    if (path.includes("/deposits")) {
      if (path.includes("/approve")) return "Deposit approved successfully!";
      if (path.includes("/reject")) return "Deposit rejected successfully!";
      return "Deposit status updated successfully!";
    }
    if (path.includes("/withdrawals")) {
      if (path.includes("/approve")) return "Withdrawal approved successfully!";
      if (path.includes("/reject")) return "Withdrawal rejected successfully!";
      return "Withdrawal status updated successfully!";
    }
    return "Updated successfully!";
  }
  
  if (method === "DELETE") {
    if (path.includes("/admin/settings/payout-cryptos")) return "Payout cryptocurrency deleted successfully!";
    if (path.includes("/admin/languages")) return "Language deleted successfully!";
    if (path.includes("/admin/countries")) return "Country deleted successfully!";
    if (path.includes("/admin/plans")) return "Investment plan deleted successfully!";
    if (path.includes("/admin/rewards/gift-codes")) return "Gift code deleted successfully!";
    if (path.includes("/admin/partners")) return "Partner deleted successfully!";
    if (path.includes("/admin/news")) return "News article deleted successfully!";
    if (path.includes("/admin/rewards/tasks")) return "Task reward deleted successfully!";
    if (path.includes("/admin/users")) return "User account deleted successfully!";
    return "Deleted successfully!";
  }
  
  return "Request successful!";
};

/* ================= POST ================= */
export const usePost = (endpoint, queryKey, isFormData = false, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (data) => {
      const shouldUseFormData =
        isFormData ||
        (typeof FormData !== "undefined" && data instanceof FormData);

      const res = await postData(endpoint, data, {
        isFormData: shouldUseFormData,
      });

      if (res?.success === false) {
        throw new Error(res.message || "Request failed");
      }

      return res;
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("POST", endpoint, res));
      }

      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

/* ================= PUT ================= */
export const usePut = (endpoint, queryKey, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (payload) => {
      let url;
      let dataToSend;

      if (payload?.id && payload?.data) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = payload.data;
      } else if (payload?.id) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = { ...payload };
        delete dataToSend.id;
      } else {
        url = endpoint;
        dataToSend = payload;
      }

      const res = await updateData(url, dataToSend);

      if (res?.success === false) throw new Error(res.message || "Update failed");

      return res;
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("PUT", endpoint, res));
      }

      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

/* ================= PATCH ================= */
export const usePatch = (endpoint, queryKey, isFormData = false, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (payload) => {
      let url;
      let dataToSend;

      if (payload?.id && payload?.data) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = payload.data;
      } else if (payload?.id) {
        url =
          typeof endpoint === "function"
            ? endpoint(payload.id)
            : endpoint;
        dataToSend = { ...payload };
        delete dataToSend.id;
      } else {
        url = endpoint;
        dataToSend = payload;
      }

      const res = await patchData(url, dataToSend, {
        isFormData,
      });

      if (res?.success === false) {
        throw new Error(res.message || "Patch failed");
      }

      return res;
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("PATCH", endpoint, res));
      }

      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

/* ================= DELETE ================= */
export const useDelete = (endpoint, queryKey, options = {}) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;

  return useMutation({
    mutationFn: async (id) => {
      if (!id) throw new Error("Missing ID");

      const url =
        typeof endpoint === "function" ? endpoint(id) : endpoint;

      const res = await deleteData(url);

      if (res?.success === false) {
        throw new Error(res.message || "Delete failed");
      }

      return res;
    },

    onSuccess: (res, variables, context) => {
      if (queryKey) {
        queryClient.invalidateQueries({
          queryKey: handleQueryKey(queryKey),
        });
      }
      queryClient.invalidateQueries(); // Force refetch of all data globally to keep tables fresh

      if (showToast) {
        toast.success(getSuccessMessage("DELETE", endpoint, res));
      }

      if (options?.onSuccess) {
        options.onSuccess(res, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (showToast) toast.error(getErrorMessage(error));
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   fetchData,
//   postData,
//   updateData,
//   patchData,
//   deleteData,
// } from "@/config/apiHelpers";
// import { toast } from "sonner";

// // Centralized error formatter
// const getErrorMessage = (error) => {
//   const data = error?.response?.data;
//   if (data?.errors && Array.isArray(data.errors)) return data.errors.join(", ");
//   if (data?.message) return data.message;
//   return error?.message || "Something went wrong. Please try again.";
// };

// // Helper function to properly handle query keys
// const handleQueryKey = (queryKey) => {
//   return Array.isArray(queryKey) ? queryKey : [queryKey];
// };

// // GET - Fetch data
// export const useFetchData = (
//   endpoint,
//   queryKey,
//   options = {}
// ) => {
//   return useQuery({
//     queryKey: handleQueryKey(queryKey || endpoint),

//     queryFn: async ({ signal }) => {
//       const res = await fetchData(endpoint, { signal });

//       if (!res?.success) {
//         throw new Error(res?.message || "Failed to fetch data");
//       }

//       return res;
//     },

//     // refetchOnWindowFocus: false,
//         refetchOnWindowFocus: options.refetchOnWindowFocus ?? false, // Make it configurable
//     enabled: options.enabled ?? true,

//     // 1ï¸âƒ£ Retry logic
//     retry: (failureCount, error) => {
//       // Do not retry cancelled requests
//       if (error?.name === "CanceledError") return false;

//       // Do not retry client errors (4xx)
//       const status = error?.response?.status;
//       if (status && status >= 400 && status < 500) return false;

//       // Retry up to 3 times
//       return failureCount < 3;
//     },

//     // 2ï¸âƒ£ Exponential backoff
//     retryDelay: (attemptIndex) => {
//       // 1s â†’ 2s â†’ 4s (max 5s)
//       return Math.min(1000 * 2 ** attemptIndex, 5000);
//     },

//     onError: (error) => {
//       // Ignore cancelled requests
//       if (error?.name === "CanceledError") return;

//       toast.error(getErrorMessage(error));
//     },
//   });
// };


// export const usePost = (endpoint, queryKey, isFormData = false) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data) => {
//       const shouldUseFormData =
//         isFormData || (typeof FormData !== "undefined" && data instanceof FormData);

//       const res = await postData(endpoint, data, shouldUseFormData);

//       if (res?.success === false) {
//         throw new Error(res.message || "Request failed");
//       }

//       return res;
//     },

//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }

//       toast.success(res?.message || "Request successful");
//     },

//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // PUT - Full update
// export const usePut = (endpoint, queryKey) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data) => {
//       const res = await updateData(endpoint, data);
//       if (!res?.success) throw new Error(res.message || "Update failed");
//       return res;
//     },
//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({ 
//           queryKey: handleQueryKey(queryKey) 
//         });
//       }
//       toast.success(res?.message || "Updated successfully");
//     },
//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // PATCH - Partial update (UPDATED: supports { id, data } pattern)
// export const usePatch = (endpoint, queryKey, isFormData = false) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (payload) => {
//       try {
//         let url;
//         let dataToSend;

//         // Pattern 1: { id, data }
//         if (payload?.id && payload?.data) {
//           url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
//           dataToSend = payload.data;
//         }
//         // Pattern 2: { id, ...rest }
//         else if (payload?.id) {
//           url = typeof endpoint === "function" ? endpoint(payload.id) : endpoint;
//           dataToSend = { ...payload };
//           delete dataToSend.id;
//         }
//         // Pattern 3: direct payload
//         else {
//           url = endpoint;
//           dataToSend = payload;
//         }

//         const res = await patchData(url, dataToSend, isFormData);

//         // Handle backend success:false
//         if (res?.success === false) {
//           throw new Error(res.message || "Patch failed");
//         }

//         return res;
//       } catch (error) {
//         throw error;
//       }
//     },

//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }
//       toast.success(res?.message || "Updated successfully");
//     },

//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };

// // DELETE - Remove data
// export const useDelete = (endpoint, queryKey) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id) => {
//       if (!id) {
//         throw new Error("Missing ID");
//       }

//       const url = typeof endpoint === "function" ? endpoint(id) : endpoint;
//       const res = await deleteData(url);

//       if (!res?.success) {
//         throw new Error(res.message || "Delete failed");
//       }

//       return res;
//     },
//     onSuccess: (res) => {
//       if (queryKey) {
//         queryClient.invalidateQueries({
//           queryKey: handleQueryKey(queryKey),
//         });
//       }
//       toast.success(res?.message || "Deleted successfully");
//     },
//     onError: (error) => {
//       toast.error(getErrorMessage(error));
//     },
//   });
// };
