"use client"
import { useEffect, useMemo, useState } from "react";
import {
  onValue,
  ref,
  remove,
  update,
} from "firebase/database";
import { database } from "@/app/lib/firebase";
import { toast } from "sonner";
import {
  CalendarCheck,
  ShieldCheck,
  Trash2,
  Users,
  MapPin,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { deleteImage, getAllUser, updateRole } from "@/app/hooks/actions";
import { useParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ItemProps = {
  id: string;
  title: string;
  image: string;
  imageId: string;
  location: string;
  itemType: string;
  postedBy: string;
};

type UserProps = {
  _id: string;
  fullName: string;
  role: "student" | "admin";
  email: string;
  studentId: string;
};

type MeetupProps = {
  id: string;
  itemId: string;
  requestId: string;
  meetupDate: string;
  meetupLocation: string;
  status: "pending" | "approved" | "rejected" | "verified";
  claimerName: string;
  proof?:string;
};

export default function AdminPage() {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [meetups, setMeetups] = useState<MeetupProps[]>([]);
  const params = useParams();
  const id = params.id;

  const [deleteItemAlert, setDeleteItemAlert] = useState<{ itemId: string; imageId?: string } | null>(null);
  const [rejectMeetupAlert, setRejectMeetupAlert] = useState<{ itemId: string; requestId: string } | null>(null);
  const [deleteMeetupAlert, setDeleteMeetupAlert] = useState<{ itemId: string; requestId: string; proof?: string } | null>(null);
  const [changeUserRoleAlert, setChangeUserRoleAlert] = useState<{ userId: string; currentRole: UserProps["role"]; newRole: UserProps["role"] } | null>(null);

  useEffect(() => {
    const itemsRef = ref(database, "items");
    const requestsRef = ref(database, "request");

    const unsubItems = onValue(itemsRef, (snap) => {
      const data = snap.val() || {};
      setItems(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
    });

    const unsubMeetups = onValue(requestsRef, (snap) => {
      const data = snap.val() || {};
      const list: MeetupProps[] = [];

      Object.entries(data).forEach(([itemId, requests]: any) => {
        Object.entries(requests || {}).forEach(([requestId, r]: any) => {
          if (r.meetupDate || r.meetupLocation) {
            list.push({
              id: requestId,
              itemId,
              requestId,
              meetupDate: r.meetupDate,
              meetupLocation: r.meetupLocation,
              status: r.status,
              claimerName: r.claimerName,
            });
          }
        });
      });

      setMeetups(list);
    });

    return () => {
      unsubItems();
      unsubMeetups();
    };
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getAllUser(id as string);
      if (data.success) {
        setUsers(data.user);
      } else {
        toast.error(data.message);
      }
    };
    getUserData();
  }, [id]);

  const verifyCampusMeetup = async (itemId: string, requestId: string) => {
    await update(ref(database), {
      [`request/${itemId}/${requestId}/status`]: "verified",
      [`items/${itemId}/itemType`]: "recovered",
    });
    toast.success("Meetup verified inside campus");
    const requestsRef = ref(database, "request");
    onValue(requestsRef, (snap) => {
      const data = snap.val() || {};
      const list: MeetupProps[] = [];
      Object.entries(data).forEach(([itemId, requests]: any) => {
        Object.entries(requests || {}).forEach(([requestId, r]: any) => {
          if (r.meetupDate || r.meetupLocation) {
            list.push({
              id: requestId,
              itemId,
              requestId,
              meetupDate: r.meetupDate,
              meetupLocation: r.meetupLocation,
              status: r.status,
              claimerName: r.claimerName,
            });
          }
        });
      });
      setMeetups(list);
    }, { onlyOnce: true });
  };

  const rejectMeetup = async (itemId: string, requestId: string) => {
    try {
      await update(ref(database), {
        [`request/${itemId}/${requestId}/status`]: "rejected",
      });
      toast.error("Meetup rejected");
      const requestsRef = ref(database, "request");
      onValue(requestsRef, (snap) => {
        const data = snap.val() || {};
        const list: MeetupProps[] = [];
        Object.entries(data).forEach(([itemId, requests]: any) => {
          Object.entries(requests || {}).forEach(([requestId, r]: any) => {
            if (r.meetupDate || r.meetupLocation) {
              list.push({
                id: requestId,
                itemId,
                requestId,
                meetupDate: r.meetupDate,
                meetupLocation: r.meetupLocation,
                status: r.status,
                claimerName: r.claimerName,
              });
            }
          });
        });
        setMeetups(list);
      }, { onlyOnce: true });
    } catch (error) {
      toast.error("Failed to reject meetup");
    } finally {
      setRejectMeetupAlert(null);
    }
  };

  const deleteItem = async (itemId: string, imageId: string) => {
    try {
      await remove(ref(database, `items/${itemId}`));
      await remove(ref(database, `request/${itemId}`));
      if (imageId) await deleteImage(id as string, imageId);
      toast.success("Item removed by admin");
      const itemsRef = ref(database, "items");
      onValue(itemsRef, (snap) => {
        const data = snap.val() || {};
        setItems(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
      }, { onlyOnce: true });
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteItemAlert(null);
    }
  };

  const deleteMeetupFully = async (itemId: string, requestId: string, proof?:string) => {
    try {
      await remove(ref(database, `request/${itemId}/${requestId}`));
      if (proof) await deleteImage(requestId, proof);
      toast.success("Meetup fully deleted");
      const requestsRef = ref(database, "request");
      onValue(requestsRef, (snap) => {
        const data = snap.val() || {};
        const list: MeetupProps[] = [];
        Object.entries(data).forEach(([itemId, requests]: any) => {
          Object.entries(requests || {}).forEach(([requestId, r]: any) => {
            if (r.meetupDate || r.meetupLocation) {
              list.push({
                id: requestId,
                itemId,
                requestId,
                meetupDate: r.meetupDate,
                meetupLocation: r.meetupLocation,
                status: r.status,
                claimerName: r.claimerName,
              });
            }
          });
        });
        setMeetups(list);
      }, { onlyOnce: true });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete meetup");
    } finally {
      setDeleteMeetupAlert(null);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: UserProps["role"]) => {
    setChangeUserRoleAlert({ userId, currentRole: users.find(u => u._id === userId)?.role || "student", newRole });
  };

  const confirmUserRoleChange = async () => {
    if (!changeUserRoleAlert) return;
    const { userId, newRole } = changeUserRoleAlert;
    if(userId === "69fa9a50439507177965a80b"){
      toast.error("Can't modify super admin");
      return;
    }
    try {
      const change = await updateRole(id as string, userId, newRole);
      if(change.success){
        toast.success(`User role updated to ${newRole}.`);
      }
      else{
        toast.error(change.message);
      }
      const data = await getAllUser(id as string);
      if (data.success) {
        setUsers(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update user role.");
    } finally {
      setChangeUserRoleAlert(null);
    }
  };

  const stats = useMemo(() => {
    return {
      users: users.length,
      items: items.length,
      meetups: meetups.length,
      pending: meetups.filter((m) => m.status === "approved").length,
    };
  }, [users, items, meetups]);

  const getStatusBadgeVariant = (status: MeetupProps["status"]) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "verified": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="text-muted-foreground">Manage campus recovery system in real-time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.items}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meetups</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.meetups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meetups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="meetups">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claimer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No meetups to display.</TableCell>
                    </TableRow>
                  ) : (
                    meetups.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.claimerName}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {m.meetupLocation}
                        </TableCell>
                        <TableCell>{m.meetupDate}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(m.status)}>
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  verifyCampusMeetup(m.itemId, m.requestId)
                                }
                              >
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  rejectMeetup(m.itemId, m.requestId)
                                }
                              >
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  deleteMeetupFully(m.itemId, m.requestId, m.proof)
                                }
                              >
                                Delete Meetup
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No users to display.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">
                          {u.fullName}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(newRole: UserProps["role"]) => handleUserRoleChange(u._id, newRole)}
                          >
                            <SelectTrigger className="w-45">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{u.studentId}</TableCell>
                        <TableCell className="text-right">
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No items to display.</TableCell>
                    </TableRow>
                  ) : (
                    items.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.title}</TableCell>
                        <TableCell>{i.location}</TableCell>
                        <TableCell><Badge variant="outline">{i.itemType}</Badge></TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove the item from the
                                  database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => setDeleteItemAlert({ itemId: i.id, imageId: i.imageId })}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={rejectMeetupAlert !== null} onOpenChange={(open) => !open && setRejectMeetupAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this meetup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => rejectMeetup(rejectMeetupAlert!.itemId, rejectMeetupAlert!.requestId)}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteItemAlert !== null} onOpenChange={(open) => !open && setDeleteItemAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItem(deleteItemAlert!.itemId, deleteItemAlert!.imageId || "")}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMeetupAlert !== null} onOpenChange={(open) => !open && setDeleteMeetupAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Meetup Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this meetup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMeetupFully(deleteMeetupAlert!.itemId, deleteMeetupAlert!.requestId, deleteMeetupAlert!.proof)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={changeUserRoleAlert !== null} onOpenChange={(open) => !open && setChangeUserRoleAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the role of <span className="font-medium">{changeUserRoleAlert?.userId}</span> from <span className="font-medium">{changeUserRoleAlert?.currentRole}</span> to <span className="font-medium">{changeUserRoleAlert?.newRole}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUserRoleChange}>Change Role</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
