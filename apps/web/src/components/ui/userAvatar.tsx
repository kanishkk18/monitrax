import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bug,
  FileText,
  Globe,
  Laptop,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Package,
  Plus,
  Server,
  Settings,
  Shield,
  Sun,
  Trash,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes'


export default function UserAvatar({user}:{user:{name?: string | null; email: string; image?: string | null}}) {
const router = useRouter();
const { theme, setTheme } = useTheme()
    const handleLogout = async () => {
        await signOut();
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mr-5 space-y-1 hover:!border-none">
        
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className='space-y-2'>

          <DropdownMenuItem className='dark:bg-[#000]'>
            
            <div className="flex justify-between items-center w-full px-3 ">
            <div onClick={() => setTheme('light')} className=" py-2 flex justify-center items-center text-center cursor-pointer rounded-md w-full hover:dark:bg-[#111]">
                <Sun/> 
            </div>
            <div onClick={() => setTheme('dark')} className=" py-2 flex justify-center items-center text-center cursor-pointer rounded-md w-full hover:dark:bg-[#111]">
                <Moon/>
            </div>
            <div onClick={() => setTheme('system')} className=" py-2 flex justify-center items-center text-center cursor-pointer rounded-md w-full hover:dark:bg-[#111]">
                <Laptop/>
            </div>
 
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <User />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Team Management</DropdownMenuLabel>
        <DropdownMenuGroup className='space-y-2'>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users />
              <span>Team Settings</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem disabled>
                  <Shield />
                  <span>Permissions</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus />
                  <span>Invite Members</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Monitor />
                    <span>Monitor Activity</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <FileText />
                        <span>Logs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Server />
                        <span>Server Status</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Globe />
                        <span>Web Traffic</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Bug />
                        <span>System Errors</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Roles Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield />
              <span>Roles</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Plus />
                  <span>Add Role</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users />
                  <span>Assign Roles</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  <span>Delete Role</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
         
        </DropdownMenuGroup>

        {/* Logout */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleLogout()}>
          <LogOut />
          <span>Log Out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
