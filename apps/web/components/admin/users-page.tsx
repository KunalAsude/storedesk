"use client";
import { SimpleTable } from "@/components/common/simple-table";
import { StatusBadge } from "@/components/common/status-badge";
import {
    Plus,
    Search
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function UsersPage({ setDialog }: any) {
  const [active, setActive] = useState("All users");
  const [query, setQuery] = useState("");
  const [invitations, setInvitations] = useState([
    { email: "meera@brandhub.in", role: "Cashier", company: "Brand Hub Mens Wear", sent: "Today, 10:14 am", expires: "4 Dec 2026", status: "Pending" },
    { email: "accounts@kids-corner.in", role: "Owner", company: "Kids Corner", sent: "24 Nov 2026", expires: "1 Dec 2026", status: "Pending" },
    { email: "stock@omfootwear.in", role: "Stock staff", company: "Om Footwear", sent: "18 Nov 2026", expires: "25 Nov 2026", status: "Expired" },
  ]);
  const userRows = active === "Platform team"
    ? [
        ["Kunal", "kunal@storedesk.in", "Super admin", "StoreDesk", "Now", "Active"],
        ["Friend", "friend@storedesk.in", "Admin", "StoreDesk", "Today", "Active"],
        ["Support", "help@storedesk.in", "Support", "StoreDesk", "Yesterday", "Active"],
      ]
    : [
        ["Rahul Patil", "rahul.patil@gmail.com", "Owner", "Brand Hub Mens Wear", "Today", "Active"],
        ["Anjali Deshmukh", "anjali@shreesaree.in", "Owner", "Shree Saree Centre", "Today", "Active"],
        ["Pooja Shinde", "pooja.shinde@gmail.com", "Cashier", "Brand Hub Mens Wear", "Today", "Active"],
      ];
  const filteredUsers = userRows.filter((row) =>
    row.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  const filteredInvitations = invitations.filter((invite) =>
    [invite.email, invite.role, invite.company, invite.status]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PLATFORM ADMIN</div>
          <h1>Users & invites</h1>
          <p>Manage your team and everyone on the platform.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setDialog("Invite user")}
        >
          <Plus />
          Invite user
        </button>
      </div>
      <div className="tabs-row" role="tablist" aria-label="User administration views">
        {["Platform team", "All users", "Invitations"].map((tab) => (
          <button
            className={active === tab ? "active" : ""}
            onClick={() => setActive(tab)}
            key={tab}
            role="tab"
            aria-selected={active === tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={active === "Invitations" ? "Search invitations" : "Search people"}
              placeholder={active === "Invitations" ? "Search invitations" : "Search people"}
            />
          </div>
          <span className="muted">
            {active === "Invitations"
              ? `${filteredInvitations.length} invitations`
              : `${filteredUsers.length} users`}
          </span>
        </div>
        {active === "Invitations" ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {["Email", "Role", "Company", "Sent", "Expires", "Status", "Actions"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((invite) => (
                  <tr key={invite.email}>
                    <td>{invite.email}</td>
                    <td>{invite.role}</td>
                    <td>{invite.company}</td>
                    <td>{invite.sent}</td>
                    <td>{invite.expires}</td>
                    <td><StatusBadge status={invite.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="text-action"
                          disabled={invite.status === "Revoked"}
                          onClick={() => {
                            setInvitations((current) => current.map((item) =>
                              item.email === invite.email
                                ? { ...item, status: "Pending", sent: "Just now" }
                                : item,
                            ));
                            toast.success(`Invitation resent to ${invite.email}`);
                          }}
                        >
                          Resend
                        </button>
                        {invite.status !== "Revoked" && (
                          <button
                            className="text-action"
                            onClick={() => {
                              setInvitations((current) => current.map((item) =>
                                item.email === invite.email ? { ...item, status: "Revoked" } : item,
                              ));
                              toast.success(`Invitation to ${invite.email} revoked`);
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvitations.length === 0 && (
              <p className="empty-state">No invitations match your search.</p>
            )}
          </div>
        ) : (
          <SimpleTable
            headers={["Name", "Email", "Role", "Company", "Last active", "Status"]}
            rows={filteredUsers}
          />
        )}
      </div>
    </>
  );
}
