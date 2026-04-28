import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Send, Loader2 } from "lucide-react";
import NewShipmentMap from "./NewShipmentMap";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { shipAPI } from "../../lib/api";

interface TimelineEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface NewShipmentDetailsProps {
  id: string;
  onBack: () => void;
}

export default function NewShipmentDetails({ id, onBack }: NewShipmentDetailsProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      author: "System AI",
      content: "Route optimized for weather conditions in Midwest.",
      timestamp: "Oct 26, 09:15 AM",
    },
    {
      id: "2",
      author: "Jane Doe (Dispatcher)",
      content: "Driver confirmed pickup window. All paperwork verified.",
      timestamp: "Oct 26, 10:30 AM",
    }
  ]);
  const [newNote, setNewNote] = useState("");

  const timeline: TimelineEvent[] = [
    {
      id: "1",
      status: "Order Created",
      location: "Los Angeles, CA",
      timestamp: "Oct 26, 08:00 AM",
      completed: true,
      current: false,
    },
    {
      id: "2",
      status: "Picked Up",
      location: "Los Angeles Distribution Center",
      timestamp: "Oct 26, 11:45 AM",
      completed: true,
      current: false,
    },
    {
      id: "3",
      status: "In Transit",
      location: "Denver, CO (Checkpoint)",
      timestamp: "Oct 27, 02:30 PM",
      completed: false,
      current: true,
    },
    {
      id: "4",
      status: "Out for Delivery",
      location: "New York Metro",
      timestamp: "Expected: Oct 28",
      completed: false,
      current: false,
    },
    {
      id: "5",
      status: "Delivered",
      location: "New York, NY",
      timestamp: "Expected: Oct 28",
      completed: false,
      current: false,
    }
  ];

  // Static route markers (origin + destination always shown)
  const staticMarkers: { id: string; position: [number, number]; title: string; facility: string; status?: string; isOrigin?: boolean; isDestination?: boolean }[] = [
    { id: "m1", position: [34.0522, -118.2437], title: "Origin", facility: "LA Dist Center", isOrigin: true },
    { id: "m3", position: [40.7128, -74.0060], title: "Destination", facility: "NY Metro Hub", isDestination: true },
  ];

  // Live ship positions fetched from backend
  const [liveMarkers, setLiveMarkers] = useState<typeof staticMarkers>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveShips = async () => {
      try {
        const ships = await shipAPI.getLive();
        const markers = ships.map((ship, idx) => ({
          id: `live-${ship.id ?? idx}`,
          position: ship.coordinates as [number, number],
          title: ship.name ?? `Ship ${idx + 1}`,
          facility: ship.location ?? "At sea",
          status: ship.status,
        }));
        setLiveMarkers(markers);
      } catch (err) {
        console.error("[NewShipmentDetails] fetchLiveShips error:", err);
        setMapError("Live ship data unavailable — showing route only.");
      } finally {
        setMapLoading(false);
      }
    };
    fetchLiveShips();
  }, [id]);  // re-fetch if navigating between shipments

  const allMapMarkers = [...staticMarkers, ...liveMarkers];
  // Legacy current-location marker (Denver checkpoint)
  const currentLocationMarker = {
    id: "m2",
    position: [39.7392, -104.9903] as [number, number],
    title: "Current Location",
    facility: "Denver Checkpoint",
    status: "In Transit",
  };
  const mapMarkers = [...allMapMarkers, currentLocationMarker];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      author: "You",
      content: newNote,
      timestamp: "Just now",
    };
    setNotes([...notes, note]);
    setNewNote("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">Shipment {id}</h1>
            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">In Transit</Badge>
          </div>
          <p className="text-gray-600">Detailed tracking and route analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Route Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {mapLoading ? (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
              ) : (
                <>
                  {mapError && (
                    <p className="text-xs text-amber-600 mb-2">{mapError}</p>
                  )}
                  <NewShipmentMap markers={mapMarkers} center={[39.0, -98.0]} zoom={4} className="h-[400px] w-full rounded-lg border" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-indigo-900">{note.author}</span>
                        <span className="text-xs text-gray-500">{note.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Add an internal note..." 
                    className="min-h-[80px]"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button className="h-auto" onClick={handleAddNote}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Origin</span>
                <span className="font-medium text-right">Los Angeles, CA</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Destination</span>
                <span className="font-medium text-right">New York, NY</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Current Phase</span>
                <span className="font-medium text-indigo-600 text-right">In Transit (Denver)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Arrival</span>
                <span className="font-medium text-right">Tomorrow, 10:00 AM</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 border-l-2 border-gray-200 ml-3">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="relative">
                    <span className={`absolute -left-[35px] bg-white p-1 rounded-full ${
                      event.completed ? "text-green-500" : event.current ? "text-indigo-500" : "text-gray-300"
                    }`}>
                      {event.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className={`w-5 h-5 ${event.current ? "fill-indigo-100" : ""}`} />
                      )}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h4 className={`text-sm font-semibold ${
                        event.current ? "text-indigo-700" : event.completed ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {event.status}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
