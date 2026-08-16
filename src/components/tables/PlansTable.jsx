"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Loader2, Edit } from "lucide-react";
import { useFetchData, useDelete } from "@/hooks/useApi";
import Pagination from "@/components/Pagination";
import {
  getStatusColor,
  formatCurrency,
  filterAndSortData,
  formatDate,
  TableRowSkeleton,
} from "@/lib/tableHelpers";
import PlanDialog from "../modals/PlanDialog";

export default function PlansTable({ searchTerm = "" }) {
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ✅ EDIT STATE
  const [openForm, setOpenForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const limit = 10;

  // DUMMY DATA
  const dummyPlans = [
    {
      _id: "1",
      title: "Basic Miner",
      minDeposit: 100,
      maxDeposit: 500,
      dailyProfit: 1.5,
      contractDuration: 30,
      isFixedDeposit: false,
      status: "Active",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Pro Miner",
      minDeposit: 500,
      maxDeposit: 2000,
      dailyProfit: 2.5,
      contractDuration: 60,
      isFixedDeposit: true,
      status: "Active",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Elite Miner",
      minDeposit: 2000,
      maxDeposit: 10000,
      dailyProfit: 4.0,
      contractDuration: 90,
      isFixedDeposit: true,
      status: "Inactive",
      createdAt: new Date().toISOString(),
    }
  ];

  const isLoading = false;
  const error = null;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const plans = dummyPlans.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const meta = { total: plans.length, page, limit, totalPages: Math.ceil(plans.length / limit) };

  const filteredData = plans;

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete?._id) return;

    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="whitespace-nowrap">Plan Title</TableHead>
              <TableHead className="whitespace-nowrap">Min Deposit</TableHead>
              <TableHead className="whitespace-nowrap">Max Deposit</TableHead>
              <TableHead className="whitespace-nowrap">Daily Profit</TableHead>
              <TableHead className="whitespace-nowrap">Duration</TableHead>
              <TableHead className="whitespace-nowrap">Has Fixed Deposit</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created At</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => <TableRowSkeleton key={i} columns={9} />)
          ) : filteredData.length ? (
            filteredData.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {plan.title}
                </TableCell>

                <TableCell className="whitespace-nowrap">{formatCurrency(plan.minDeposit)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(plan.maxDeposit)}</TableCell>
                <TableCell className="whitespace-nowrap">{plan.dailyProfit}%</TableCell>
                <TableCell className="whitespace-nowrap">{plan.contractDuration} days</TableCell>

                <TableCell className="text-center whitespace-nowrap">
                  {plan.isFixedDeposit ? "Yes" : "No"}
                </TableCell>

                <TableCell>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </TableCell>

                <TableCell className="whitespace-nowrap">{formatDate(plan.createdAt)}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu
                    open={openMenuId === plan._id}
                    onOpenChange={(open) =>
                      setOpenMenuId(open ? plan._id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* ✅ EDIT BUTTON OPENS MODAL */}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPlan(plan);
                          setOpenForm(true);
                          setOpenMenuId(null);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteClick(plan)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-10 text-gray-500"
              >
                No investment plans found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* ✅ EDIT / CREATE MODAL */}
      <PlanDialog
        open={openForm}
        setOpen={setOpenForm}
        initialData={selectedPlan}
      />

      {/* ✅ DELETE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {planToDelete?.title || "this plan"}
            </span>
            ? This action cannot be undone.
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? (
                <>
                  Deleting
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}