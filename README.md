# feedback-loader

One script tag that puts a **Feedback** button in a web app: the [BugDrop](https://bugdrop.dev)
widget, set up once with where reports go and which build of the widget to load, so each app
only has to say who it is.

Written for the apps of [PrintCRM](https://printcrm.com), and by default it files their reports
with PrintCRM. It works for anyone else too: see [Using it in your own app](#using-it-in-your-own-app).

## Adding it to an app

```html
<script src="https://cdn.jsdelivr.net/gh/PrintCRM/feedback-loader@1/printcrm-feedback.js"
        data-app="JobMonitor"
        data-version="1.0.412+d484e7c"></script>
```

Put it near the end of the page. The button is added once however many times the tag is
included, and after the rest of the page, so a slow widget host never holds the app up.

| Attribute | What it's for |
|---|---|
| `data-app` | The app's name. Falls back to `<meta name="application-name">`, then the page title. |
| `data-version` | The build, ideally `major.minor.build+commit`; a full commit hash is cut to seven characters. Falls back to `<meta name="application-version">`. |
| `data-repo` | Where reports are filed, as `owner/repo`. Defaults to PrintCRM's inbox. |
| `data-widget` | The BugDrop widget to load. Defaults to `widget.v1.js`, BugDrop's major pin. |
| any other `data-*` | Passed to BugDrop as it is: `data-position`, `data-theme`, `data-label`, `data-screenshot` and [the rest](https://bugdrop.dev/docs/configuration). |

The name and version reach each report as BugDrop's `data-app-version`, shown in the issue's
System Info as `JobMonitor 1.0.412+d484e7c`. Let the build fill them in, so nobody has to
remember to.

**ASP.NET Core.** Stamp a build number when publishing, for example
`dotnet publish -p:Version=1.0.${{ github.run_number }}` in GitHub Actions; the SDK appends the
commit. Then render both from the assembly:

```csharp
using System.Reflection;

public static class AppBuild
{
    public static string Name { get; } = typeof(AppBuild).Assembly.GetName().Name!;

    public static string Version { get; } =
        typeof(AppBuild).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "0.0.0";
}
```

```cshtml
<script src="https://cdn.jsdelivr.net/gh/PrintCRM/feedback-loader@1/printcrm-feedback.js"
        data-app="@AppBuild.Name" data-version="@AppBuild.Version"></script>
```

**Vite.** Vite fills `%VITE_...%` placeholders in `index.html` from the environment, so a build
step that sets `VITE_APP_VERSION` fills in the meta tag:

```html
<meta name="application-name" content="Bulk Order">
<meta name="application-version" content="%VITE_APP_VERSION%">
<script src="https://cdn.jsdelivr.net/gh/PrintCRM/feedback-loader@1/printcrm-feedback.js"></script>
```

**Anything else.** The two meta tags, or the two attributes, written by whatever builds the page.

BugDrop's button sits bottom-right unless `data-position="bottom-left"` says otherwise. Keep an
app's own floating notices clear of it.

## Using it in your own app

Set `data-repo` to your own repository, and install the [BugDrop GitHub App](https://bugdrop.dev)
on it. Left out, your users' reports are filed in PrintCRM's inbox instead of yours.

## Versions

| URL | Cached by jsDelivr | For |
|---|---|---|
| `@1/printcrm-feedback.js` | 7 days, refreshed on each release | Apps: every compatible release. |
| `@1.0.0/printcrm-feedback.js` | forever | One release exactly. |

`VERSION` at the top of `printcrm-feedback.js` is the release. Raise it for every change to the
file. A push to `main` with a new `VERSION` tags the release (`1.0.0`, no "v", so jsDelivr can
resolve ranges), publishes it on GitHub, and asks jsDelivr to refresh `@1`, `@1.0` and
`@latest`. A change that apps would have to adapt to raises the major, so apps on `@1` stay
where they are until they move.

Checked on every push and pull request:

- **Plain ASCII.** The file is served into pages whatever charset they declare.
- **It parses** as JavaScript.
- **`VERSION` was raised** if the file changed since the last release. jsDelivr keeps each
  release as it first saw it, so a change under an old version would never reach anyone.

Two things the loader must never become: a copy of BugDrop's widget, since BugDrop works out
its API address from the widget's own URL; or a file named with "bugdrop" and "widget"
together, which the widget uses to find its own tag.

## License

[MIT](LICENSE). Copyright (c) 2026 Data Quarry Inc.
