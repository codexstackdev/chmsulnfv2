"use client"

import { useState } from 'react'
import { motion, AnimatePresence, Variants} from 'framer-motion'
import { Search, Plus, MapPin, LogOut, User, Settings } from 'lucide-react'

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useParams, useRouter } from 'next/navigation'
import { logout } from '@/app/hooks/actions'
import { toast } from 'sonner'

const LostAndFoundBrowse = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const categories = ['All', 'Electronics', 'Accessories', 'Documents', 'Clothing', 'Other']
  
  const mockItems = [
    {
      id: 1,
      title: "MacBook Pro 14\"",
      description: "Space Gray, found in the Main Library study area. Has a sticker on the back.",
      status: "Lost",
      category: "Electronics",
      date: "Oct 24, 2023",
      location: "Main Library",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 2,
      title: "Leather Wallet",
      description: "Brown leather wallet containing a student ID card for 'Alex Johnson'.",
      status: "Found",
      category: "Accessories",
      date: "Oct 23, 2023",
      location: "Student Center Cafeteria",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 3,
      title: "Student ID Card",
      description: "Official university ID card found near the North Gate entrance.",
      status: "Found",
      category: "Documents",
      date: "Oct 22, 2023",
      location: "North Gate",
      image: "https://images.unsplash.com/photo-1614036417651-efe591214972?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 4,
      title: "Denim Jacket",
      description: "Blue denim jacket, size Medium. Left in the Science Building Room 302.",
      status: "Lost",
      category: "Clothing",
      date: "Oct 21, 2023",
      location: "Science Building",
      image: "https://images.unsplash.com/photo-1576871333019-220ef346ddbb?auto=format&fit=crop&q=80&w=400"
    }
  ]

  const filteredItems = mockItems.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleLogout = async()=>{
    try {
      const data = await logout();
      if(data.success){
        toast.success(data.message);
        router.replace("/");
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Search className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">Lost & Found</span>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/addItem/${id}`)} className="hidden sm:inline-flex" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Report Item
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Item
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 sm:px-8">
        <div className="mb-10 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
              <p className="text-muted-foreground mt-1 text-sm">Search and filter through items reported on campus.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full px-4"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md"
              >
                <div className="aspect-4/3 overflow-hidden bg-muted">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute left-3 top-3">
                    <Badge variant={item.status === 'Lost' ? "destructive" : "default"} className={item.status === 'Found' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </div>
                </div>
                
                <div className="p-5 pt-0">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No items found</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">We couldn't find any items matching your current search or filters.</p>
            <Button 
              variant="link"
              onClick={() => {setActiveCategory('All'); setSearchQuery('');}}
              className="mt-4"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-muted/30 py-12 mt-20">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} University Lost & Found. For student use only.</p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LostAndFoundBrowse
