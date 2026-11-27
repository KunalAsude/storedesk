"use client";

export function MiniTheme({ name }: { name: string }) {
  return (
    <div className="mini-theme" data-theme={name}>
      <div className="mini-sidebar">
        <b>StoreDesk</b>
        <i />
        <i />
        <i />
      </div>
      <div className="mini-content">
        <b>Companies</b>
        <div className="mini-stats">
          <i />
          <i />
        </div>
        <div className="mini-button" />
      </div>
    </div>
  );
}
