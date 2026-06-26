import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "@/lib/orgContext";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "@/components/shared/EmptyState";

import {
  Plus,
  Search,
  Target,
  MoreHorizontal,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import moment from "moment";
import { useToast } from "@/components/ui/use-toast";

const statusColors = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-indigo-100 text-indigo-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company_name: "",
  job_title: "",
  source: "website",
  status: "new",
  priority: "medium",
  value: 0,
  notes: "",
};

export default function Leads() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useOrg();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [leads, setLeads] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLeads(data || []);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.first_name.trim())
      errors.first_name = "First name required";

    if (!form.last_name.trim())
      errors.last_name = "Last name required";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);

    const leadData = {
      ...form,
      organization_id: organization?.id || null,
    };
    try {
      if (editId) {
        const { error } = await supabase
          .from("leads")
          .update(leadData)
          .eq("id", editId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("leads")
          .insert([leadData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lead created successfully",
        });
      }

      setShowForm(false);
      setEditId(null);
      setForm(defaultForm);
      loadLeads();

    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Lead Deleted",
    });

    loadLeads();
  };

  const openEdit = (lead) => {
    setEditId(lead.id);
    setForm({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company_name: lead.company_name || "",
      job_title: lead.job_title || "",
      source: lead.source || "website",
      status: lead.status || "new",
      priority: lead.priority || "medium",
      value: lead.value || 0,
      notes: lead.notes || "",
    });

    setShowForm(true);
  };

  const filtered = leads.filter((lead) => {
    const searchMatch =
      `${lead.first_name} ${lead.last_name} ${lead.email} ${lead.company_name}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all" || lead.status === statusFilter;

    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500">
            {filtered.length} Leads
          </p>
        </div>

        <Button
          onClick={() => {
            setEditId(null);
            setForm(defaultForm);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>
      <div className="flex gap-3 flex-wrap">

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <Input
            className="pl-9"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {filtered.length === 0 ? (

        <EmptyState
          icon={Target}
          title="No Leads Found"
          description="Create your first lead."
          actionLabel="Add Lead"
          onAction={() => {
            setEditId(null);
            setForm(defaultForm);
            setShowForm(true);
          }}
        />

      ) : (

        <div className="bg-white rounded-xl border overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3"></th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((lead) => (

                <tr
                  key={lead.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >

                  <td className="px-4 py-3">
                    {lead.first_name} {lead.last_name}
                  </td>

                  <td className="px-4 py-3">
                    {lead.company_name || "-"}
                  </td>

                  <td className="px-4 py-3">

                    <Badge className={statusColors[lead.status]}>
                      {lead.status}
                    </Badge>

                  </td>

                  <td className="px-4 py-3">
                    ${lead.value || 0}
                  </td>

                  <td className="px-4 py-3">
                    {moment(lead.created_at).format("MMM DD, YYYY")}
                  </td>

                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >

                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>

                        <button className="p-2 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onClick={() => openEdit(lead)}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(lead.id)}
                        >
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      <Dialog
        open={showForm}
        onOpenChange={setShowForm}
      >

        <DialogContent className="max-w-lg">

          <DialogHeader>

            <DialogTitle>

              {editId ? "Edit Lead" : "Add Lead"}

            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>First Name</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    last_name: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div>
            <Label>Company</Label>
            <Input
              value={form.company_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  company_name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Job Title</Label>
            <Input
              value={form.job_title}
              onChange={(e) =>
                setForm({
                  ...form,
                  job_title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editId
                  ? "Update Lead"
                  : "Create Lead"}
            </Button>

          </div>



        </DialogContent>

      </Dialog>

    </div>
  );
}
