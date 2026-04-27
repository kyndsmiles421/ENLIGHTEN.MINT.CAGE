# ───────────────────────────────────────────────────────────────────
# ENLIGHTEN.MINT.CAFE — Sovereign Engine ProGuard / R8 Rules (V68.56)
# ───────────────────────────────────────────────────────────────────
# IMPORTANT — what R8/ProGuard does and does NOT do here:
#
#   • This Android shell is a Capacitor WebView wrapper. The bulk of
#     your code is the React bundle inside `assets/public/`, which R8
#     CANNOT see (it's plain JS, already minified by webpack).
#   • R8 only optimizes the small Java/Kotlin Capacitor + plugin
#     layer. The wins here are: stripping unused plugin classes,
#     trimming androidx, and shrinking unused XML resources.
#   • The HEAVY assets win comes from `aaptOptions.ignoreAssetsPattern`
#     in build.gradle (~18 MB stripped from the AAB).
#
# Safety: every rule below is a -keep that prevents R8 from breaking
# something the WebView relies on at runtime. Add new -keep entries
# only if a release build crashes with NoClassDefFoundError /
# NoSuchMethodError.

# ── Capacitor + Cordova bridge ─────────────────────────────────────
# Capacitor uses reflection to discover @CapacitorPlugin classes and
# JSExport-annotated methods. Stripping these breaks every plugin.
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin *;
    @com.getcapacitor.PluginMethod *;
    @com.getcapacitor.JSExport *;
}
-keep class * extends com.getcapacitor.Plugin { *; }

# Legacy Cordova compatibility (Capacitor still includes the bridge)
-keep class org.apache.cordova.** { *; }

# ── WebView JavaScript Interface ──────────────────────────────────
# Methods exposed via @JavascriptInterface MUST survive R8. The
# Capacitor BridgeWebChromeClient relies on this.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# ── App entry points ──────────────────────────────────────────────
-keep public class cafe.mint.enlighten.** { *; }
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# ── Java reflection from JS ───────────────────────────────────────
# The ContextBus + ResonanceField use evaluateJavascript() round-trips.
# These don't need extra rules (they're pure JS), but the bridge that
# carries them does — covered by the Capacitor block above.

# ── AndroidX + Material ───────────────────────────────────────────
-dontwarn androidx.**
-keep class androidx.lifecycle.** { *; }
-keep class androidx.core.splashscreen.** { *; }

# ── Kotlin stdlib (Capacitor uses Kotlin internally) ──────────────
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ── Optional: keep stack traces readable in Crashlytics / logs ────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Suppress harmless warnings from transitive deps ───────────────
-dontwarn javax.annotation.**
-dontwarn org.checkerframework.**
-dontwarn com.google.errorprone.annotations.**
