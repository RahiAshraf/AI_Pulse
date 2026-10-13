import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { branches, sections, years } from "@/lib/validation";
import { auth } from "@/lib/firebase";
import type { Student } from "@/types";

const ALL = "all";
type SortKey = "name" | "roll" | "registered";

export function StudentTable({
  students,
  isLoading = false,
}: {
  students: Student[];
  isLoading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [section, setSection] = useState(ALL);
  const [sort, setSort] = useState<SortKey>("registered");
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = students.filter(
      (s) =>
        (branch === ALL || s.branch === branch) &&
        (year === ALL || s.year === year) &&
        (section === ALL || s.section === section) &&
        (q === "" ||
          s.fullName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)),
    );

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.fullName.localeCompare(b.fullName);
      if (sort === "roll") return a.rollNumber.localeCompare(b.rollNumber);
      return b.registeredAt.localeCompare(a.registeredAt);
    });
  }, [students, query, branch, year, section, sort]);

  const exportCsv = () => {
    const header = [
      "Name",
      "Roll Number",
      "Email",
      "Phone",
      "Branch",
      "Year",
      "Section",
      "Status",
      "Registered At",
    ];
    const body = rows.map((s) => [
      s.fullName,
      s.rollNumber,
      s.email,
      s.phone,
      s.branch,
      s.year,
      s.section,
      s.status,
      s.registeredAt,
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-pulse-students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const callApi = async (method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Your admin session has expired. Please sign in again.");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin-students", {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error || "Unable to complete the request.");
  };

  const saveStudent = async (values: StudentFormValues) => {
    setIsSaving(true);
    try {
      if (editing) {
        const { password: _password, ...profile } = values;
        await callApi("PATCH", { ...profile, id: editing.id, status: editing.status });
      } else {
        await callApi("POST", values);
      }
      toast.success(editing ? "Student updated." : "Student account created.");
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the student.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (student: Student) => {
    const nextStatus = student.status === "disabled" ? "active" : "disabled";
    const message =
      nextStatus === "disabled"
        ? "Disable this student's access?"
        : "Enable this student's access?";
    if (!window.confirm(message)) return;
    setBusyId(student.id);
    try {
      await callApi("PATCH", {
        id: student.id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        email: student.email,
        phone: student.phone,
        branch: student.branch,
        year: student.year,
        section: student.section,
        status: nextStatus,
      });
      toast.success(nextStatus === "disabled" ? "Student disabled." : "Student enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update student status.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteStudent = async (student: Student) => {
    if (!window.confirm("Are you sure you want to permanently delete this student?")) return;
    setBusyId(student.id);
    try {
      await callApi("DELETE", { id: student.id });
      toast.success("Student permanently deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the student.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Manage Students
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} visible of {students.length} student records
          </p>
        </div>
        <Button
          variant="hero"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Add Student
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, roll number or email"
            className="pl-9"
          />
        </div>
        <Button variant="neon" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Filter
          value={branch}
          onChange={setBranch}
          placeholder="All branches"
          options={[...branches]}
        />
        <Filter value={year} onChange={setYear} placeholder="All years" options={[...years]} />
        <Filter
          value={section}
          onChange={setSection}
          placeholder="All sections"
          options={[...sections]}
        />
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registered">Newest first</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="roll">Roll number</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="glass p-10 text-center text-sm text-muted-foreground">
          Loading students...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered students yet."
          description="Student records will appear here once registrations are stored in the database."
        />
      ) : (
        <>
          <div className="glass hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-semibold">{s.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.rollNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.branch}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.section}</td>
                    <td className="px-4 py-3">
                      <Status status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(s.registeredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Actions
                        student={s}
                        onView={setViewing}
                        onEdit={(student) => {
                          setEditing(student);
                          setFormOpen(true);
                        }}
                        onToggle={toggleStatus}
                        onDelete={deleteStudent}
                        busy={busyId === s.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {rows.map((s) => (
              <div key={s.id} className="glow-card p-4 text-sm">
                <p className="font-semibold">{s.fullName}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-muted-foreground">{s.rollNumber}</p>
                  <Status status={s.status} />
                </div>
                <dl className="mt-3 space-y-1 text-muted-foreground">
                  <div>{s.email}</div>
                  <div>{s.phone}</div>
                  <div>
                    {s.branch} · Year {s.year} · Section {s.section}
                  </div>
                  <div>{formatDate(s.registeredAt)}</div>
                </dl>
                <Actions
                  student={s}
                  onView={setViewing}
                  onEdit={(student) => {
                    setEditing(student);
                    setFormOpen(true);
                  }}
                  onToggle={toggleStatus}
                  onDelete={deleteStudent}
                  busy={busyId === s.id}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        onSave={saveStudent}
        isSaving={isSaving}
      />
      <StudentDetails student={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

type StudentFormValues = {
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  section: string;
  password: string;
};

function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (values: StudentFormValues) => Promise<void>;
  isSaving: boolean;
}) {
  const [values, setValues] = useState<StudentFormValues>({
    fullName: "",
    rollNumber: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    section: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const update = (key: keyof StudentFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  const openChanged = (next: boolean) => {
    if (next) {
      setShowPassword(false);
      setValues(
        student
          ? {
              fullName: student.fullName,
              rollNumber: student.rollNumber,
              email: student.email,
              phone: student.phone,
              branch: student.branch,
              year: student.year,
              section: student.section,
              password: "",
            }
          : {
              fullName: "",
              rollNumber: "",
              email: "",
              phone: "",
              branch: "",
              year: "",
              section: "",
              password: "",
            },
      );
    }
    onOpenChange(next);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      Object.values(values)
        .slice(0, 3)
        .some((value) => !value.trim()) ||
      !values.branch ||
      !values.year ||
      !values.section
    ) {
      toast.error("Please complete all required fields.");
      return;
    }
    if (!student && values.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    void onSave(values);
  };
  return (
    <Dialog open={open} onOpenChange={openChanged}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
          <DialogDescription>
            {student
              ? "Update the student profile without creating a duplicate record."
              : "Create a Firebase Authentication account and matching student profile."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["fullName", "Full Name"],
              ["rollNumber", "Roll Number"],
              ["email", "Email"],
              ["phone", "Phone (optional)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>
                {label}
                {key !== "phone" ? " *" : ""}
              </Label>
              <Input
                value={values[key]}
                onChange={(event) => update(key, event.target.value)}
                type={key === "email" ? "email" : "text"}
              />
            </div>
          ))}
          {!student ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  value={values.password}
                  onChange={(event) => update("password", event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          ) : null}
          <SelectField
            label="Branch *"
            value={values.branch}
            options={[...branches]}
            onChange={(value) => update("branch", value)}
            placeholder="Select branch"
          />
          <SelectField
            label="Year *"
            value={values.year}
            options={[...years]}
            onChange={(value) => update("year", value)}
            placeholder="Select year"
          />
          <SelectField
            label="Section *"
            value={values.section}
            options={[...sections]}
            onChange={(value) => update("section", value)}
            placeholder="Select section"
          />
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSaving}>
              {isSaving ? "Saving..." : student ? "Save Changes" : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Actions({
  student,
  onView,
  onEdit,
  onToggle,
  onDelete,
  busy,
}: {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onToggle: (student: Student) => void;
  onDelete: (student: Student) => void;
  busy: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="View student"
        title="View"
        onClick={() => onView(student)}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Edit student"
        title="Edit"
        onClick={() => onEdit(student)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={student.status === "disabled" ? "Enable student" : "Disable student"}
        title={student.status === "disabled" ? "Enable" : "Disable"}
        disabled={busy}
        onClick={() => void onToggle(student)}
      >
        {student.status === "disabled" ? (
          <ToggleRight className="size-4 text-cyan" />
        ) : (
          <ToggleLeft className="size-4 text-gold" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete student"
        title="Delete"
        disabled={busy}
        onClick={() => void onDelete(student)}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

function Status({ status }: { status: Student["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${status === "disabled" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"}`}
    >
      {status}
    </span>
  );
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Pending" : date.toLocaleDateString();
}
function StudentDetails({ student, onClose }: { student: Student | null; onClose: () => void }) {
  return (
    <Dialog
      open={Boolean(student)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Full profile and account status.</DialogDescription>
        </DialogHeader>
        {student ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Name", student.fullName],
              ["Roll Number", student.rollNumber],
              ["Email", student.email],
              ["Phone", student.phone || "Not provided"],
              ["Branch", student.branch],
              ["Year", student.year],
              ["Section", student.section],
              ["Created Date", formatDate(student.registeredAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Account Status
              </p>
              <div className="mt-1">
                <Status status={student.status} />
              </div>
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Filter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
