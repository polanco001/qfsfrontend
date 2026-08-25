{activeTab === 'kyc' && (
  <div>
    <SectionHeader title="KYC Documents" sub={`${dashData.kycDocs.length} total · ${pendingKYC} pending`} />
    <NotifBanner items={buildNotifs('kycDocs')} onDismiss={id => handleDismiss('kycDocs', id)} onDismissAll={() => handleDismissAll('kycDocs')} />
    <CardShell>
      <TableWrap minW={560}>
        <thead className={theadCls}>
          <tr>
            <TH>Applicant</TH>
            <TH>SSN</TH>  {/* ← Full SSN column */}
            <TH>Location</TH>
            <TH>Documents</TH>
            <TH>Status</TH>
            <TH right>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {dashData.kycDocs.length === 0
            ? <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No KYC submissions yet</td></tr>
            : dashData.kycDocs.map((k: any) => (
                <tr key={k._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                  <TD>
                    <p style={{ fontWeight: 600, fontSize: 12 }}>{k.fullName}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{k.email}</p>
                  </TD>
                  <TD>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>
                      {k.ssn || '—'}  {/* ← Full SSN */}
                    </span>
                  </TD>
                  <TD>
                    <p style={{ fontSize: 12 }}>{k.address}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{k.city}, {k.state}</p>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{k.country}</p>
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[{ path: k.driverLicenseFront, label: 'Front' }, { path: k.driverLicenseBack, label: 'Back' }, { path: k.proofOfResidence, label: 'Res.' }].map((doc, idx) => (
                        <div key={idx} onClick={() => window.open(imgUrl(doc.path), '_blank')}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 4px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)', width: 46, cursor: 'pointer', gap: 2 }}
                          className="bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                          <ImageIcon size={11} className="text-slate-400" />
                          <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center' }} className="text-slate-600 dark:text-slate-300">{doc.label}</span>
                        </div>
                      ))}
                    </div>
                  </TD>
                  <TD><StatusPill status={k.status} /></TD>
                  <TD right>
                    {k.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}><CheckCircle size={14} /></button>
                        <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)',  color: '#dc2626' }}><XCircle size={14} /></button>
                      </div>
                    )}
                  </TD>
                </tr>
              ))
          }
        </tbody>
      </TableWrap>
    </CardShell>
  </div>
)}
