// Module 17 — Foreground Location Service (Android track). See ../lessons/FORMAT.md
// and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "foreground-gps-android",
  title: "Foreground Location Service",
  emoji: "🛰️",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "why-foreground-service",
      title: "Why a foreground service",
      steps: [
        {
          type: "text",
          md: [
            "## GPS doesn't run for free in the background",
            "Module 11's `LiveViewModel` reads GPS fixes while `LiveScreen` is on screen — but a real walk lasts 30 minutes, and the walker's phone spends most of that time in their pocket, screen off, some other app up front. Android is aggressive about killing background work to save battery: **background execution limits** throttle what a plain background coroutine can do, and **Doze mode** suspends network and CPU access almost entirely once the screen's been off a while.",
            "There's exactly one sanctioned way around both: a **foreground service**. It's a `Service` the system treats as user-visible and important — in exchange, it must show a **persistent notification** the whole time it runs, so the user always knows something is actively using their phone. That trade (a notification you can't dismiss, for GPS that keeps working) is the deal every fitness-tracking, navigation, and delivery app on the Play Store makes.",
          ],
        },
        {
          type: "text",
          md: [
            "## Android 14 wants to know *what kind* of foreground service",
            "Since Android 14 (API 34), declaring a foreground service isn't enough — you have to declare its **type**, right in the manifest, and the system enforces it. PawWalk's tracking service is `foregroundServiceType=\"location\"`. That type also gates a manifest permission: alongside the always-needed `FOREGROUND_SERVICE`, a location-typed foreground service needs `FOREGROUND_SERVICE_LOCATION` too — skip it and `startForeground()` throws a `SecurityException` at runtime, not a compile error.",
          ],
        },
        {
          type: "code",
          title: "AndroidManifest.xml",
          source: String.raw`<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

<application>
    <service
        android:name=".tracking.WalkTrackingService"
        android:foregroundServiceType="location"
        android:exported="false" />
</application>`,
          caption: "Three permissions, one service tag. `foregroundServiceType=\"location\"` is what Android 14+ checks against `FOREGROUND_SERVICE_LOCATION` at the moment `startForeground()` is called — declare one without the other and the service crashes the instant it tries to go foreground.",
        },
        {
          type: "quiz",
          q: "Why does PawWalk's walk-tracking code run inside a foreground service instead of a plain background coroutine (viewModelScope.launch)?",
          choices: [
            "Foreground services run on a faster thread than coroutines",
            "A plain background coroutine gets throttled or killed by Android's background execution limits and Doze once the app isn't visible; a foreground service with a persistent notification is exempt from those limits",
            "Coroutines can't call location APIs at all",
            "It's only a style preference — either works identically in the background",
          ],
          answer: 1,
          explain: "Android's background limits exist specifically to stop apps from silently draining battery once the user isn't looking at them. A foreground service opts back into unrestricted-ish execution by making the tradeoff visible: a notification the user can always see, in exchange for GPS that doesn't get throttled mid-walk.",
          nudge: "What does Android do to background coroutines that keep running after the screen turns off — and what's the one type of component exempted from that, as long as it shows something to the user?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "start-it-correctly",
      title: "Start it correctly",
      steps: [
        {
          type: "text",
          md: [
            "## startForeground() has a clock on it",
            "`WalkTrackingService` extends `Service` (not `ViewModel` — a `Service` is its own Android component, alongside `Activity`). Its `onStartCommand()` is called once the service is started, and from there you have only a few seconds to call **`startForeground(id, notification)`** — miss that window and the system ANRs (kills the app for being unresponsive) or kills the service outright. The rule of thumb: call it first, before anything else in `onStartCommand()`.",
            "Since Android 8 (API 26), every notification needs a **`NotificationChannel`** — a category the user can individually mute or configure in system settings — created once before it's ever used. The notification itself is what makes the foreground service visible: \"PawWalk is tracking a walk\", with no way for the user to swipe it away while the service runs. That persistent, undismissable notification *is* the user's signal that GPS is active — not a courtesy, the whole point of the mechanism.",
          ],
        },
        {
          type: "code",
          title: "tracking/WalkTrackingService.kt",
          source: String.raw`class WalkTrackingService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val channel = NotificationChannel(
            "walk_tracking",
            "Walk Tracking",
            NotificationManager.IMPORTANCE_LOW,
        )
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)

        val notification = NotificationCompat.Builder(this, "walk_tracking")
            .setContentTitle("PawWalk is tracking a walk")
            .setSmallIcon(R.drawable.ic_paw)
            .setOngoing(true)
            .build()

        startForeground(1, notification)
        return START_STICKY
    }
}`,
          caption: "IMPORTANCE_LOW keeps the notification silent (no sound/heads-up) since it's informational, not urgent. START_STICKY tells the system to recreate the service (with a null intent) if it's killed to reclaim memory — the walk should keep being tracked, not silently stop.",
        },
        {
          type: "exercise",
          title: "Call startForeground",
          prompt: [
            "`notification` is already built above the marker inside `onStartCommand`. Go foreground with it, using notification id `1`:",
            "Call `startForeground(1, notification)`.",
          ],
          starter: String.raw`override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = buildTrackingNotification()
    // your code here
    return START_STICKY
}`,
          solution: String.raw`override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = buildTrackingNotification()
    startForeground(1, notification)
    return START_STICKY
}`,
          checks: [
            { re: /startForeground\(1,notification\)/, hint: "Call `startForeground(1, notification)` — the id first, then the notification you just built." },
          ],
          mustNot: [
            { re: /startForeground\(1,buildTrackingNotification\(\)\)/, hint: "Pass the `notification` variable you already have, not a fresh call to `buildTrackingNotification()`." },
          ],
          success: "That's the exact call that flips this service into the foreground — the persistent notification appears the instant it runs.",
        },
        {
          type: "quiz",
          q: "What happens if a started service never calls startForeground(id, notification) in time?",
          choices: [
            "Nothing — startForeground is optional as long as the service eventually shows a notification",
            "The system considers the app unresponsive and can ANR or kill it — startForeground has a short window to be called after the service starts",
            "The service runs fine, just without a notification",
            "Android automatically calls it for you after a timeout",
          ],
          answer: 1,
          explain: "Starting a foreground service is a promise to the system: \"I will show a notification right away.\" Not honoring that promise quickly is treated as a bug — the system can ANR the app or kill the service, exactly the outcome a foreground service exists to prevent.",
          nudge: "The whole reason a foreground service is exempt from background limits is that the user can always see it running. What would the system have to assume if a service claimed to be foreground but never actually posted anything visible?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "stream-fixes-fused",
      title: "Stream fixes with FusedLocationProvider",
      steps: [
        {
          type: "text",
          md: [
            "## The same FusedLocationProviderClient, running inside the service",
            "Module 11 called `FusedLocationProviderClient.requestLocationUpdates` from a `ViewModel`, tied to whatever screen was on top. Here the exact same API runs inside the foreground service instead — the fixes keep flowing no matter what's on screen, because the service, not the screen, owns the subscription.",
            "A **`LocationRequest`** still configures the stream: `Priority.PRIORITY_HIGH_ACCURACY` for the best fix the device can produce, and an interval in milliseconds for how often to check. Ties back to module 13's `callbackFlow` — wrapping `requestLocationUpdates`'s callback-based API in a `callbackFlow` turns fixes into a `Flow<Location>` the rest of the service (and eventually the socket-publish code from module 11) can `collect` like any other stream.",
          ],
        },
        {
          type: "text",
          md: [
            "## Interval is a battery dial, not just a data-freshness dial",
            "A shorter interval means smoother, more frequent dots on the route — and a phone that's constantly waking its GPS radio and CPU. Walk tracking doesn't need fixes every second; a few seconds apart is plenty for a walking pace, and it's the difference between a walker's phone lasting the whole shift or dying by the third walk of the day.",
          ],
        },
        {
          type: "code",
          title: "tracking/WalkTrackingService.kt — requesting the stream",
          source: String.raw`private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }

@SuppressLint("MissingPermission")
private fun startTrackingFixes() {
    val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000L).build()
    fused.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
}`,
          caption: "3000L milliseconds — every 3 seconds, the same cadence module 11's LiveViewModel used from the foreground screen. @SuppressLint(\"MissingPermission\") documents that the permission check (lesson 4) already ran before this ever gets called.",
        },
        {
          type: "exercise",
          title: "Build the LocationRequest",
          prompt: [
            "Build a `LocationRequest` for high-accuracy fixes every 4 seconds (4000 milliseconds):",
            "1. `LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 4000L)`.\n2. Finish the chain with `.build()`.",
          ],
          starter: String.raw`private fun buildTrackingRequest(): LocationRequest {
    // your code here
}`,
          solution: String.raw`private fun buildTrackingRequest(): LocationRequest {
    return LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 4000L).build()
}`,
          checks: [
            { re: /return LocationRequest\.Builder\(Priority\.PRIORITY_HIGH_ACCURACY,4000L\)/, hint: "`return` the request directly — `LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 4000L)`, priority first, interval millis second. Building it into an unused variable and returning something else won't do." },
            { re: /PRIORITY_HIGH_ACCURACY,4000L\)\.build\(\)/, hint: "Finish that same builder chain with `.build()`." },
          ],
          success: "That's a real LocationRequest — high accuracy, checked every 4 seconds, ready to hand to requestLocationUpdates.",
        },
        {
          type: "quiz",
          q: "Why does PRIORITY_HIGH_ACCURACY cost more battery than a lower priority like PRIORITY_BALANCED_POWER_ACCURACY?",
          choices: [
            "It doesn't — priority only affects how the data is formatted",
            "High accuracy asks the device to actively use GPS hardware (and keep its radio on) for the tightest possible fix, instead of relying on cheaper signals like Wi-Fi/cell towers that a lower priority is willing to accept",
            "High accuracy fixes are cached, so it's actually cheaper",
            "Priority only matters indoors, not outdoors",
          ],
          answer: 1,
          explain: "PRIORITY_HIGH_ACCURACY tells the fused provider you want the best fix possible, which usually means the GPS radio itself — the most power-hungry location source on the device. Lower priorities let the provider settle for Wi-Fi or cell-tower-based estimates, which are coarser but far cheaper to keep running.",
          nudge: "GPS hardware, Wi-Fi scanning, and cell-tower triangulation aren't equally expensive to keep active. Which one does 'the best possible fix' usually require?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "permissions-doze-stopping",
      title: "Permissions, Doze & stopping",
      steps: [
        {
          type: "text",
          md: [
            "## Foreground location and background location are TWO grants",
            "`ACCESS_FINE_LOCATION` is the runtime permission module 11 already requests — it covers location while the app is visible (in the foreground) or running a foreground service the user just started. On Android 10+, tracking a walk with the screen off and the app fully backgrounded — no active foreground-service notification the user just triggered — needs a second, separate grant: **`ACCESS_BACKGROUND_LOCATION`**. The system won't even show that dialog until fine/coarse location has already been granted, so it has to be requested *after*, never bundled into the same request.",
            "Be straightforward with the user about why: a permission rationale that says \"so your dog walk keeps tracking even with your phone locked\" earns a grant far more often than a vague \"needs your location\" prompt. And be honest about **Doze** too — even a foreground service can see its network access deferred for a few minutes if the device has been stationary and screen-off long enough; PawWalk's offline-first design from module 14 is exactly what makes that survivable instead of catastrophic.",
          ],
        },
        {
          type: "text",
          md: [
            "## Stop the service when the walk ends",
            "A foreground service that outlives its walk is a battery leak with a permanent notification attached. The moment the walk is marked done — the booking completes, or the walker taps \"End Walk\" — the service should stop itself: **`stopForeground(STOP_FOREGROUND_REMOVE)`** takes down the notification, then **`stopSelf()`** tells the system this service is finished and can be destroyed.",
          ],
        },
        {
          type: "code",
          title: "tracking/WalkTrackingService.kt — permission check + stopping",
          source: String.raw`private fun hasBackgroundLocationPermission(): Boolean =
    ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.ACCESS_BACKGROUND_LOCATION,
    ) == PackageManager.PERMISSION_GRANTED

fun endWalk() {
    fused.removeLocationUpdates(locationCallback)
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
}`,
          caption: "removeLocationUpdates first — no point letting fixes keep arriving after the notification (and the user's awareness that tracking is on) is already gone. STOP_FOREGROUND_REMOVE dismisses the notification outright, as opposed to leaving a stale one behind.",
        },
        {
          type: "exercise",
          title: "End the walk",
          prompt: [
            "Write `endWalk()`, which stops the foreground service cleanly:",
            "1. `stopForeground(STOP_FOREGROUND_REMOVE)` to take down the notification.\n2. `stopSelf()` to let the system destroy the service.",
          ],
          starter: String.raw`fun endWalk() {
    fused.removeLocationUpdates(locationCallback)
    // your code here
}`,
          solution: String.raw`fun endWalk() {
    fused.removeLocationUpdates(locationCallback)
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
}`,
          checks: [
            { re: /stopForeground\(STOP_FOREGROUND_REMOVE\)/, hint: "Call `stopForeground(STOP_FOREGROUND_REMOVE)` to dismiss the notification." },
            { re: /stopSelf\(\)/, hint: "Follow up with `stopSelf()` so the system tears down the service." },
          ],
          mustNot: [
            { re: /stopForeground\(true\)/, hint: "Use the `STOP_FOREGROUND_REMOVE` constant, not the deprecated boolean `true` overload." },
          ],
          success: "That's the exact shutdown sequence — no more fixes, no more notification, no more service, the moment a walk ends.",
        },
        {
          type: "quiz",
          q: "Why is ACCESS_BACKGROUND_LOCATION a separate permission from ACCESS_FINE_LOCATION, requested only after foreground location is already granted?",
          choices: [
            "It's not actually separate — it's just an alias for ACCESS_FINE_LOCATION",
            "Background location is far more sensitive (it can track a user with no visible activity happening), so Android 10+ requires an explicit, separate, sequential grant for it, on top of foreground location",
            "Background location is only needed on tablets, not phones",
            "It's requested first, before fine location, not after",
          ],
          answer: 1,
          explain: "Foreground location access is easy for a user to reason about — the app is open, of course it can see where they are. Background access means the app can keep watching location with no screen open at all, which is a much bigger privacy ask — so the platform makes it its own permission, grantable only after the user has already agreed to foreground access.",
          nudge: "Think about what's different, from a privacy standpoint, between an app reading your location while you're actively looking at it versus reading it with the app completely out of sight.",
        },
      ],
    },
  ],
});
