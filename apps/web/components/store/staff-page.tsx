"use client";
import { SimpleTable } from "@/components/common/simple-table";
import {
    Filter,
    Plus,
    Search
} from "lucide-react";

export function StaffPage({ setDialog }: any) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE</div>
          <h1>Staff</h1>
          <p>Make sure everyone has the right access in your store.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setDialog("Invite staff")}
        >
          <Plus />
          Invite staff
        </button>
      </div>
      <div className="panel">
        <div className="list-toolbar">
          <div className="search-field">
            <Search />
            <input placeholder="Search staff" />
          </div>
          <button className="button secondary">
            <Filter />
            Role
          </button>
        </div>
        <SimpleTable
          headers={[
            "Name",
            "Email / phone",
            "Role",
            "Discount limit",
            "Last active",
            "Status",
          ]}
          rows={[
            [
              "Rahul Patil",
              "rahul.patil@gmail.com",
              "Owner",
              "No limit",
              "Now",
              "Active",
            ],
            [
              "Pooja Shinde",
              "pooja.shinde@gmail.com",
              "Cashier",
              "10%",
              "Today, 2:40 pm",
              "Active",
            ],
            [
              "Ganesh Kale",
              "+91 98224 12345",
              "Stock staff",
              "—",
              "Yesterday",
              "Active",
            ],
          ]}
        />
      </div>
    </>
  );
}
