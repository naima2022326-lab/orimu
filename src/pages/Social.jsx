import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity } from 'lucide-react';
import FriendsList from '../components/community/FriendsList';
import ActivityFeed from '../components/community/ActivityFeed';

export default function Social() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Social</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[hsl(222,47%,9%)]">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
