import React, { useEffect, useState } from 'react';
import { buildingService } from '../services/buildingService';
import { apiRequest } from '../services/api';
import {
  Layers,
  Building2,
  DoorOpen,
  Search,
  Accessibility,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function IndoorNavigationPage() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBldg, setSelectedBldg] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const data = await buildingService.getAll();
        setBuildings(data || []);
        if (data && data.length > 0) {
          // Default to CS Block
          const csBldg = data.find((b) => b.code === 'SIT-CS') || data[0];
          setSelectedBldg(csBldg);
        }
      } catch (err) {
        console.error('Failed to load buildings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchFloors = async () => {
      if (!selectedBldg) return;
      try {
        const floorData = await buildingService.getFloors(selectedBldg.id);
        setFloors(floorData || []);
        if (floorData && floorData.length > 0) {
          setSelectedFloor(floorData[0]);
        } else {
          setSelectedFloor(null);
        }
      } catch (err) {
        console.error('Failed to load floors:', err);
      }
    };
    fetchFloors();
  }, [selectedBldg]);

  const displayedRooms = selectedFloor?.rooms || [];
  const filteredRooms = displayedRooms.filter(
    (r) =>
      r.room_name.toLowerCase().includes(search.toLowerCase()) ||
      r.room_code.toLowerCase().includes(search.toLowerCase()) ||
      (r.department && r.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-600" />
          <span>Indoor Navigation & Multi-Floor Intelligence</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Floor layout directories, classroom capacities, laboratories, and departmental office locations.
        </p>
      </div>

      {/* Building Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBldg(b)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              selectedBldg?.id === b.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      {selectedBldg && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor Switcher & Building Specs (1 col) */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedBldg.code}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedBldg.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedBldg.description}</p>
              </div>

              {/* Floor Levels */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Floor Level ({floors.length})
                </span>
                <div className="space-y-1.5">
                  {floors.map((flr) => (
                    <button
                      key={flr.id}
                      onClick={() => setSelectedFloor(flr)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        selectedFloor?.id === flr.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{flr.floor_name}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedFloor?.id === flr.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {flr.rooms?.length || 0} Rooms
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Building Egress & Accessibility Status */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">Vertical Circulation:</span>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Passenger Elevator:</span>
                  <span className={selectedBldg.has_elevator ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {selectedBldg.has_elevator ? 'Available' : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Ground Ramp Access:</span>
                  <span className={selectedBldg.has_ramp ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {selectedBldg.has_ramp ? 'Verified Ramp' : 'Stairs Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Directory for Active Floor (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedFloor?.floor_name || 'Floor Directory'} &bull; Cataloged Rooms
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Showing cataloged rooms, labs, and staff spaces.
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No rooms cataloged for this floor level yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-blue-700 px-2 py-0.5 rounded bg-blue-100">
                          {room.room_code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                          {room.room_type}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">{room.room_name}</h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          Capacity: {room.capacity}
                        </span>
                        {room.department && (
                          <span className="font-semibold text-slate-700">
                            Dept: {room.department}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
