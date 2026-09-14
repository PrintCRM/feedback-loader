/*! printcrm-feedback | Copyright (c) 2026 Data Quarry Inc. | MIT License | https://github.com/PrintCRM/feedback-loader */
// The PrintCRM Feedback button: BugDrop's "report a problem" widget, set up once for every
// PrintCRM app.
//
// An app includes one tag and says only who it is; where reports go and which widget build is
// used live here, so changing either is one edit for every app:
//
//   <script src="https://cdn.jsdelivr.net/gh/PrintCRM/feedback-loader@1/printcrm-feedback.js"
//           data-app="JobMonitor" data-version="1.0.412+d484e7c"></script>
//
// data-app / data-version fall back to <meta name="application-name"> and
// <meta name="application-version">, then the page title. They reach the report as BugDrop's
// data-app-version ("JobMonitor 1.0.412+d484e7c"), shown in the issue's System Info.
// Any other data-* on the tag (data-position, data-theme, data-label, data-repo, data-widget)
// is passed to the widget as it is.
//
// Using this outside PrintCRM? Set data-repo to your own repository, with the BugDrop GitHub
// App installed on it. Left out, your users' reports go to PrintCRM instead of to you.
//
// Rules this file lives by, checked on every push:
// - Plain ASCII: it is served into pages whatever charset they declare.
// - Never a copy of BugDrop's widget. BugDrop derives its API address from the widget's own
//   URL, so the widget is always loaded from BugDrop's host; this only points at it.
// - Never named with "bugdrop" and "widget" together: the widget finds its own tag by those.
// - VERSION is major.minor.patch, raised for every change. jsDelivr serves each release as it
//   first saw it, forever. A change an app would have to adapt to raises the major, so apps
//   on the old major are left where they are.
(function () {
    'use strict';

    var VERSION = '1.0.0';

    var WIDGET = 'https://bugdrop.neonwatty.workers.dev/widget.v1.js';   // major pin: BugDrop's own advice for production
    var REPO = 'PrintCRM/Feedback';
    var MAX = 128;                                                        // what data-app-version accepts

    // Characters the widget refuses in data-app-version: control characters and invisible
    // formatting ones (soft hyphen, zero-width spaces and joiners, bidi marks, BOM).
    var INVISIBLE = [[0x0000, 0x001F], [0x007F, 0x009F], [0x00AD, 0x00AD], [0x200B, 0x200F],
                     [0x2028, 0x202E], [0x2060, 0x206F], [0xFEFF, 0xFEFF]];

    var self = document.currentScript;
    if (!self || window.PrintCRMFeedback) return;                        // once per page, however often included

    var own = self.dataset;

    function meta(name) {
        var m = document.querySelector('meta[name="' + name + '"]');
        return m && m.content ? m.content : '';
    }

    function visible(code) {
        for (var i = 0; i < INVISIBLE.length; i++) {
            if (code >= INVISIBLE[i][0] && code <= INVISIBLE[i][1]) return false;
        }
        return true;
    }

    function clean(text) {
        var s = String(text || '');
        var out = '';
        for (var i = 0; i < s.length; i++) {
            if (visible(s.charCodeAt(i))) out += s.charAt(i);
        }
        return out.trim();
    }

    // "1.0.412+d484e7c08d4a5b..." reads as "1.0.412+d484e7c".
    function shortCommit(version) {
        var plus = version.lastIndexOf('+');
        if (plus < 0) return version;
        var commit = version.slice(plus + 1);
        return /^[0-9a-f]{8,}$/i.test(commit) ? version.slice(0, plus + 8) : version;
    }

    var app = clean(own.app || meta('application-name') || document.title);
    var version = shortCommit(clean(own.version || meta('application-version')));
    var appVersion = [app, version].filter(Boolean).join(' ').slice(0, MAX).trim();

    var widget = document.createElement('script');
    widget.src = own.widget || WIDGET;
    widget.dataset.repo = own.repo || REPO;
    if (appVersion) widget.dataset.appVersion = appVersion;
    Object.keys(own).forEach(function (key) {
        if (key !== 'app' && key !== 'version' && key !== 'repo' && key !== 'widget') widget.dataset[key] = own[key];
    });

    window.PrintCRMFeedback = { loader: VERSION, app: app, version: version, repo: widget.dataset.repo, widget: widget.src };

    function add() { document.body.appendChild(widget); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
    else add();
})();
