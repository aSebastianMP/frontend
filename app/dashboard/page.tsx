"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import api from "@/lib/axios";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const categoryStyles = {
  date: {
    emoji: "💖",
    className: "bg-pink-400 border-pink-500",
  },

  movie: {
    emoji: "🎬",
    className: "bg-violet-400 border-violet-500",
  },

  coffee: {
    emoji: "☕",
    className: "bg-amber-400 border-amber-500",
  },

  trip: {
    emoji: "✈️",
    className: "bg-sky-400 border-sky-500",
  },

  birthday: {
    emoji: "🎂",
    className: "bg-orange-400 border-orange-500",
  },
};

export default function DashboardPage() {

  const router = useRouter();

  const [events, setEvents] =
    useState<any[]>([]);

  const [
    upcomingReminders,
    setUpcomingReminders
  ] = useState<any[]>([]);

  const [
    anniversaries,
    setAnniversaries
  ] = useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [
    selectedEvent,
    setSelectedEvent
  ] = useState<any>(null);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription
  ] = useState("");

  const [category, setCategory] =
    useState("date");

  const [
    reminderMinutes,
    setReminderMinutes
  ] = useState<number>(0);

  const [memory, setMemory] =
    useState(false);

  const [
    startDate,
    setStartDate
  ] = useState<Date | null>(
    new Date()
  );

  const [
    endDate,
    setEndDate
  ] = useState<Date | null>(
    new Date()
  );

  const formatLocalDateTime = (
    date: Date
  ) => {

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
      date.getSeconds()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const logout = () => {

    localStorage.removeItem("token");

    router.push("/login");
  };

  const calculateUpcomingReminders = (
    eventsList: any[]
  ) => {

    const now = new Date();

    const upcoming =
      eventsList.filter(
        (event) => {

          if (
            !event.extendedProps
              .reminderMinutes
          ) {
            return false;
          }

          const eventDate =
            new Date(event.start);

          const reminderTime =
            new Date(
              eventDate.getTime() -
              (
                event.extendedProps
                  .reminderMinutes *
                60000
              )
            );

          return (
            reminderTime > now
          );
        }
      );

    upcoming.sort(
      (a, b) =>
        new Date(a.start).getTime() -
        new Date(b.start).getTime()
    );

    setUpcomingReminders(
      upcoming.slice(0, 5)
    );
  };

  const calculateAnniversaries = (
    eventsList: any[]
  ) => {

    const today = new Date();

    const currentMonth =
      today.getMonth();

    const currentDay =
      today.getDate();

    const matches =
      eventsList.filter(
        (event) => {

          if (
            !event.extendedProps
              .memory
          ) {
            return false;
          }

          const eventDate =
            new Date(event.start);

          return (
            eventDate.getMonth() ===
              currentMonth &&
            eventDate.getDate() ===
              currentDay
          );
        }
      );

    const formatted =
      matches.map((event) => {

        const eventDate =
          new Date(event.start);

        const years =
          today.getFullYear() -
          eventDate.getFullYear();

        return {
          ...event,
          years,
        };
      });

    setAnniversaries(
      formatted
    );
  };

  const fetchEvents = async () => {

    try {

      const response =
        await api.get(
          "/api/events"
        );

      const formattedEvents =
        response.data.map(
          (event: any) => ({
            id: event.id,

            title: event.title,

            start:
              event.startDate,

            end:
              event.endDate,

            extendedProps: {

              description:
                event.description,

              category:
                event.category,

              reminderMinutes:
                event.reminderMinutes,

              memory:
                event.memory,
            },
          })
        );

      setEvents(
        formattedEvents
      );

      calculateUpcomingReminders(
        formattedEvents
      );

      calculateAnniversaries(
        formattedEvents
      );

    } catch (error) {

      console.error(error);

      router.push("/login");
    }
  };

  const handleDateClick = (
    info: any
  ) => {

    const clickedDate =
      info.date;

    setSelectedEvent(null);

    setTitle("");

    setDescription("");

    setCategory("date");

    setReminderMinutes(0);

    setMemory(false);

    setStartDate(
      new Date(clickedDate)
    );

    setEndDate(
      new Date(clickedDate)
    );

    setOpen(true);
  };

  const handleEventClick = (
    info: any
  ) => {

    setSelectedEvent(
      info.event
    );

    setTitle(
      info.event.title
    );

    setDescription(
      info.event.extendedProps
        .description || ""
    );

    setCategory(
      info.event.extendedProps
        .category || "date"
    );

    setReminderMinutes(
      info.event.extendedProps
        .reminderMinutes || 0
    );

    setMemory(
      info.event.extendedProps
        .memory || false
    );

    setStartDate(
      info.event.start
    );

    setEndDate(
      info.event.end ||
      info.event.start
    );

    setOpen(true);
  };

  const handleEventDrop = async (
    info: any
  ) => {

    try {

      const start =
        info.event.start;

      const end =
        info.event.end ||
        info.event.start;

      await api.put(
        `/api/events/${info.event.id}`,
        {

          title:
            info.event.title,

          description:
            info.event.extendedProps
              .description,

          category:
            info.event.extendedProps
              .category || "date",

          reminderMinutes:
            info.event.extendedProps
              .reminderMinutes || 0,

          memory:
            info.event.extendedProps
              .memory || false,

          startDate:
            formatLocalDateTime(
              start
            ),

          endDate:
            formatLocalDateTime(
              end
            ),
        }
      );

      fetchEvents();

    } catch (error) {

      console.error(error);

      info.revert();
    }
  };

  const saveEvent = async () => {

    try {

      const payload = {

        title,

        description,

        category,

        reminderMinutes,

        memory,

        startDate:
          startDate
            ? formatLocalDateTime(
                startDate
              )
            : null,

        endDate:
          endDate
            ? formatLocalDateTime(
                endDate
              )
            : null,
      };

      if (selectedEvent) {

        await api.put(
          `/api/events/${selectedEvent.id}`,
          payload
        );

      } else {

        await api.post(
          "/api/events",
          payload
        );
      }

      setOpen(false);

      setTitle("");

      setDescription("");

      setCategory("date");

      setReminderMinutes(0);

      setMemory(false);

      setSelectedEvent(null);

      fetchEvents();

    } catch (error) {

      console.error(error);
    }
  };

  const deleteEvent = async () => {

    if (!selectedEvent) return;

    try {

      await api.delete(
        `/api/events/${selectedEvent.id}`
      );

      setOpen(false);

      setSelectedEvent(null);

      fetchEvents();

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    fetchEvents();

  }, []);

  return (

    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 p-6">

      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-rose-500">
              Agenda ✨
            </h1>

            <p className="text-slate-500">
              Plan your moments together
            </p>

          </div>

          <Button
            onClick={logout}
            className="rounded-2xl bg-rose-400 hover:bg-rose-500"
          >
            Logout
          </Button>

        </div>

        {anniversaries.length > 0 && (

          <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-3xl shadow-xl p-6 space-y-4">

            <h2 className="text-3xl font-bold">
              💖 Today in Your Story
            </h2>

            <div className="space-y-3">

              {anniversaries.map(
                (event) => (

                  <div
                    key={event.id}
                    className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm"
                  >

                    <h3 className="text-xl font-semibold">
                      {event.title}
                    </h3>

                    <p className="text-sm text-white/90">

                      {event.years}
                      {" "}
                      year
                      {event.years > 1 ? "s" : ""}
                      {" "}
                      since this memory ✨

                    </p>

                  </div>
                )
              )}

            </div>

          </div>

        )}

        {upcomingReminders.length > 0 && (

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">

            <h2 className="text-2xl font-bold text-rose-500">
              Upcoming Reminders ⏰
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              {upcomingReminders.map(
                (event) => (

                  <div
                    key={event.id}
                    className="rounded-2xl bg-rose-50 p-4 border border-rose-100"
                  >

                    <h3 className="font-semibold text-lg">

                      {
                        categoryStyles[
                          event.extendedProps.category as keyof typeof categoryStyles
                        ]?.emoji
                      }

                      {" "}

                      {event.title}

                    </h3>

                    <p className="text-slate-500 text-sm">

                      {new Date(
                        event.start
                      ).toLocaleString()}

                    </p>

                    <p className="text-rose-400 text-sm mt-2">

                      Reminder:
                      {" "}

                      {
                        event.extendedProps
                          .reminderMinutes
                      }

                      {" "}
                      minutes before

                    </p>

                  </div>
                )
              )}

            </div>

          </div>

        )}

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <FullCalendar
            plugins={[
              dayGridPlugin,
              interactionPlugin
            ]}

            initialView="dayGridMonth"

            height="auto"

            editable={true}

            events={events}

            dateClick={
              handleDateClick
            }

            eventClick={
              handleEventClick
            }

            eventDrop={
              handleEventDrop
            }

            eventContent={(
              eventInfo
            ) => {

              const category =
                eventInfo.event
                  .extendedProps
                  .category as keyof typeof categoryStyles;

              const style =
                categoryStyles[
                  category
                ];

              return (

                <div
                  className={`
                    text-white
                    text-xs
                    font-medium
                    rounded-xl
                    px-2
                    py-1
                    border
                    shadow-sm
                    overflow-hidden
                    whitespace-nowrap
                    text-ellipsis
                    max-w-full
                    ${style?.className || "bg-gray-400"}
                  `}
                >

                  {style?.emoji || "✨"}

                  {" "}

                  {
                    eventInfo.event
                      .title
                  }

                </div>
              );
            }}
          />

        </div>

      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="rounded-3xl">

          <DialogHeader>

            <DialogTitle className="text-2xl text-rose-500">

              {selectedEvent
                ? "Edit Event 💖"
                : "New Event ✨"}

            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4">

            <Input
              placeholder="Event title"

              value={title}

              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }

              className="rounded-2xl"
            />

            <Textarea
              placeholder="Description"

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              className="rounded-2xl"
            />

            <div className="space-y-2">

              <label className="text-sm text-slate-500">
                Reminder
              </label>

              <select
                value={reminderMinutes}

                onChange={(e) =>
                  setReminderMinutes(
                    Number(
                      e.target.value
                    )
                  )
                }

                className="w-full rounded-2xl border p-3"
              >

                <option value={0}>
                  No reminder
                </option>

                <option value={10}>
                  10 minutes before
                </option>

                <option value={30}>
                  30 minutes before
                </option>

                <option value={60}>
                  1 hour before
                </option>

                <option value={1440}>
                  1 day before
                </option>

              </select>

            </div>

            <div className="flex items-center gap-3">

              <input
                type="checkbox"

                checked={memory}

                onChange={(e) =>
                  setMemory(
                    e.target.checked
                  )
                }

                className="h-4 w-4"
              />

              <label className="text-sm text-slate-600">
                💖 Save as memory
              </label>

            </div>

            <div className="space-y-2">

              <label className="text-sm text-slate-500">
                Category
              </label>

              <select
                value={category}

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }

                className="w-full rounded-2xl border p-3"
              >

                <option value="date">
                  💖 Date
                </option>

                <option value="movie">
                  🎬 Movie
                </option>

                <option value="coffee">
                  ☕ Coffee
                </option>

                <option value="trip">
                  ✈️ Trip
                </option>

                <option value="birthday">
                  🎂 Birthday
                </option>

              </select>

            </div>

            <div className="space-y-2">

              <label className="text-sm text-slate-500">
                Start
              </label>

              <DatePicker
                selected={startDate}

                onChange={(
                  date: Date | null
                ) =>
                  setStartDate(date)
                }

                showTimeSelect

                dateFormat="Pp"

                className="w-full rounded-2xl border p-3"
              />

            </div>

            <div className="space-y-2">

              <label className="text-sm text-slate-500">
                End
              </label>

              <DatePicker
                selected={endDate}

                onChange={(
                  date: Date | null
                ) =>
                  setEndDate(date)
                }

                showTimeSelect

                dateFormat="Pp"

                className="w-full rounded-2xl border p-3"
              />

            </div>

            <Button
              onClick={saveEvent}

              className="w-full rounded-2xl bg-rose-400 hover:bg-rose-500"
            >

              {selectedEvent
                ? "Save Changes 💖"
                : "Save Event 💖"}

            </Button>

            {selectedEvent && (

              <Button
                onClick={deleteEvent}

                className="w-full rounded-2xl bg-red-400 hover:bg-red-500"
              >

                Delete Event 🗑️

              </Button>

            )}

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}