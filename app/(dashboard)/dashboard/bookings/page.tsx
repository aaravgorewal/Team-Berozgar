import { BookingList } from "@/components/bookings/booking-list";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { getBookings } from "@/app/actions/bookings";
import { getAssets } from "@/app/actions/assets";

export default async function BookingsPage() {
  const [bookings, assets] = await Promise.all([
    getBookings(),
    getAssets(),
  ]);

  const bookableAssets = assets.filter(a => a.isSharedBookable);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Bookings</h2>
          <p className="text-muted-foreground">
            Book shared rooms, vehicles, or equipment.
          </p>
        </div>
        <CreateBookingDialog bookableAssets={bookableAssets} />
      </div>

      <BookingList initialData={bookings} />
    </div>
  );
}
