"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ChevronDown, Trash2, Plus, FlaskConical, LayoutDashboard, ClipboardList } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Labsdashboard() {
  const [labTests, setLabTests] = useState([]);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({ testName: "", price: "" });
  const [submitting, setSubmitting] = useState(false);

  // Auth travels in the httpOnly session cookie (sent automatically same-origin).
  const authHeaders = () => ({ "Content-Type": "application/json" });

  const getTestsData = async () => {
    try {
      const response = await axios({
        url: `/api/v1/tests/gettests`,
        method: "GET",
        headers: authHeaders(),
      });
      setTests(response.data.tests);
    } catch (error) {
      console.error(error);
    }
  };

  const gettests = async () => {
    try {
      const response = await axios({
        url: `/api/v1/tests/gettestsforlab`,
        method: "POST",
        headers: authHeaders(),
      });
      setLabTests(response.data.tests);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTestsData();
    gettests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios({
        url: `/api/v1/tests/addlabtest`,
        method: "POST",
        data: JSON.stringify({
          test_name: formData.testName,
          test_price: formData.price,
        }),
        headers: authHeaders(),
      });
      gettests();
      setFormData({ testName: "", price: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDelete = async (id) => {
    try {
      await axios({
        url: `/api/v1/tests/deletelabtest/${id}`,
        method: "DELETE",
        headers: authHeaders(),
      });
      gettests();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Lab dashboard</h1>
              <p className="text-muted-foreground">
                Add tests to your catalogue and manage pricing.
              </p>
            </div>
          </div>
          <Link
            href="/labsdashboard/bookings"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ClipboardList className="h-4 w-4" />
            Bookings
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Add test form */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Add a new test</h2>
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="testName">Test</Label>
                  <div className="relative">
                    <select
                      id="testName"
                      value={formData.testName}
                      onChange={handleChange}
                      required
                      className="flex h-11 w-full appearance-none rounded-md border border-input bg-secondary/40 px-3.5 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="" disabled>
                        Select a test
                      </option>
                      {tests.map((test) => (
                        <option key={test.id} value={test.test_name}>
                          {test.test_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter test price"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                  {submitting ? "Adding..." : "Add test"}
                </Button>
              </form>
            </div>
          </div>

          {/* Added tests */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Your tests{" "}
              <span className="text-muted-foreground">({labTests.length})</span>
            </h2>

            {labTests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <FlaskConical className="h-6 w-6" />
                </span>
                <p className="text-muted-foreground">
                  No tests added yet. Add your first test on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {labTests.map((test) => (
                  <div
                    key={test.test_id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <FlaskConical className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-medium leading-snug">
                          {test.test_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{test.test_price}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(test.test_id)}
                      aria-label="Delete test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Labsdashboard;
