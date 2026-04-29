export const translations = {
  // App-level
  'app.title': { en: 'SC Group — Tug Management', th: 'SC Group — ระบบจัดการเรือทัก' },
  'app.reset': { en: 'Reset Demo', th: 'รีเซ็ตเดโม' },

  // Personas
  'persona.dispatcher': { en: 'Dispatcher', th: 'ผู้จัดเรือ' },
  'persona.dispatcher.sub': { en: 'Back-office operations', th: 'สำนักงานปฏิบัติการ' },
  'persona.captain': { en: 'Captain', th: 'นายเรือ' },
  'persona.captain.sub': { en: 'Tug master — mobile', th: 'นายเรือทัก — มือถือ' },
  'persona.crew': { en: 'Crew', th: 'ลูกเรือ' },
  'persona.crew.sub': { en: 'Crew member — mobile', th: 'ลูกเรือ — มือถือ' },

  // Nav
  'nav.schedule': { en: 'Vessel Schedule', th: 'แผนงานเรือ' },
  'nav.queue': { en: 'Tug Queue', th: 'คิวเรือทัก' },
  'nav.readiness': { en: 'Tug Readiness', th: 'สถานะเรือทัก' },
  'nav.shift': { en: 'Shift Planner', th: 'ตารางกะ' },
  'nav.crewAssign': { en: 'Crew Assignment', th: 'คนประจำเรือ' },
  'nav.berth': { en: 'Berth / Unberth Log', th: 'บันทึกเข้า/ออก' },
  'nav.home': { en: 'Home', th: 'หน้าหลัก' },
  'nav.back': { en: 'Back', th: 'ย้อนกลับ' },

  // Common
  'common.date': { en: 'Date', th: 'วันที่' },
  'common.shift': { en: 'Shift', th: 'กะการทำงาน' },
  'common.save': { en: 'Save', th: 'บันทึก' },
  'common.cancel': { en: 'Cancel', th: 'ยกเลิก' },
  'common.confirm': { en: 'Confirm', th: 'ยืนยัน' },
  'common.edit': { en: 'Edit', th: 'แก้ไข' },
  'common.delete': { en: 'Delete', th: 'ลบ' },
  'common.add': { en: 'Add', th: 'เพิ่ม' },
  'common.search': { en: 'Search', th: 'ค้นหา' },
  'common.clear': { en: 'Clear', th: 'ล้างข้อมูล' },
  'common.yes': { en: 'Yes', th: 'ใช่' },
  'common.no': { en: 'No', th: 'ไม่ใช่' },
  'common.berth': { en: 'Berth', th: 'เข้า' },
  'common.unberth': { en: 'Unberth', th: 'ออก' },
  'common.innerBay': { en: 'Inner Bay', th: 'ในอ่าว' },
  'common.outerBay': { en: 'Outer Bay', th: 'นอกอ่าว' },
  'common.recordedBy': { en: 'Recorded by', th: 'ผู้บันทึก' },

  // Shifts
  'shift.morning': { en: 'Morning (06:00–14:00)', th: 'เช้า (06:00–14:00)' },
  'shift.afternoon': { en: 'Afternoon (14:00–22:00)', th: 'บ่าย (14:00–22:00)' },
  'shift.night': { en: 'Night (22:00–06:00)', th: 'กลางคืน (22:00–06:00)' },

  // Tug sizes / groups
  'size.large': { en: 'Large Tug', th: 'เรือทักใหญ่' },
  'size.medium': { en: 'Medium Tug', th: 'เรือทักกลาง' },
  'size.small': { en: 'Small Tug', th: 'เรือทักเล็ก' },
  'size.pilot': { en: 'Pilot Boat', th: 'เรือนำร่อง' },
  'size.rope': { en: 'Rope Boat', th: 'เรือเชือก' },

  // Readiness statuses
  'status.ready': { en: 'Ready', th: 'พร้อม' },
  'status.maintenance': { en: 'Maintenance', th: 'ซ่อมบำรุง' },
  'status.unavailable': { en: 'Unavailable', th: 'ไม่พร้อม' },
  'status.contracted': { en: 'Contracted', th: 'ทำงานตามสัญญา' },

  // Plan workflow
  'plan.upload': { en: 'Upload Port Schedule', th: 'อัปโหลดแผนจากท่าเรือ' },
  'plan.fleetConfirm': { en: 'Run Fleet Confirm', th: 'ตรวจสอบ Fleet' },
  'plan.post': { en: 'Post Schedule', th: 'โพสต์ตาราง' },
  'plan.view.list': { en: 'List View', th: 'มุมมองตาราง' },
  'plan.view.matrix': { en: 'Matrix View', th: 'มุมมองเมทริกซ์' },
  'plan.status.draft': { en: 'Draft', th: 'ร่าง' },
  'plan.status.uploaded': { en: 'Uploaded', th: 'อัปโหลดแล้ว' },
  'plan.status.fleetConfirmed': { en: 'Fleet Confirmed', th: 'ยืนยัน Fleet' },
  'plan.status.noTug': { en: 'No Tug Available', th: 'ไม่มีเรือทักว่าง' },
  'plan.status.published': { en: 'Published', th: 'เผยแพร่แล้ว' },
  'plan.overnight': { en: 'Overnight', th: 'ข้ามคืน' },
  'plan.upload.title': { en: 'Upload Vessel Schedule', th: 'อัปโหลดแผนเรือ' },
  'plan.upload.from': { en: 'Source', th: 'ที่มา' },
  'plan.upload.received': { en: 'Received', th: 'ได้รับเมื่อ' },
  'plan.upload.extractedVessels': { en: 'Vessels in file', th: 'จำนวนเรือในไฟล์' },
  'plan.upload.extract': { en: 'Extract & Load', th: 'แยก & โหลด' },
  'plan.fleetConfirm.running': { en: 'Running Fleet Confirm…', th: 'กำลังตรวจสอบ Fleet…' },
  'plan.fleetConfirm.done': { en: 'Fleet Confirm complete', th: 'ตรวจสอบ Fleet เสร็จสิ้น' },
  'plan.post.confirm': { en: 'Post this schedule to Shipment module?', th: 'โพสต์ตารางนี้ไปยังระบบ Shipment?' },
  'plan.post.done': { en: 'Schedule Posted — movements are now visible to Captain & Crew apps', th: 'โพสต์ตารางเรียบร้อย — นายเรือ และลูกเรือ เห็นตารางแล้ว' },

  // Vessel Schedule Planner
  'vsp.title': { en: 'Vessel Schedule Planner', th: 'แผนงานเรือ' },
  'vsp.sub': { en: 'Daily vessel movements — berth & unberth', th: 'แผนการเข้า-ออกเรือประจำวัน' },
  'vsp.col.vessel': { en: 'Vessel', th: 'ชื่อเรือ' },
  'vsp.col.grt': { en: 'GRT', th: 'GRT' },
  'vsp.col.loa': { en: 'LOA', th: 'LOA' },
  'vsp.col.arrTime': { en: 'Arr. Time', th: 'เวลาเข้า' },
  'vsp.col.depTime': { en: 'Dep. Time', th: 'เวลาออก' },
  'vsp.col.terminal': { en: 'Terminal', th: 'ท่าเทียบ' },
  'vsp.col.tug': { en: 'Tug', th: 'ทัก' },
  'vsp.col.pilot': { en: 'Pilot', th: 'นำร่อง' },
  'vsp.col.agent': { en: 'Agent / Tel', th: 'ตัวแทน / โทร' },
  'vsp.col.draft': { en: 'Draft (F/M/A)', th: 'กินน้ำ (หัว/กลาง/ท้าย)' },
  'vsp.col.remark': { en: 'Remark', th: 'หมายเหตุ' },
  'vsp.pill.vessels': { en: 'Vessels', th: 'ลำ' },
  'vsp.pill.berth': { en: 'Berth', th: 'เข้า' },
  'vsp.pill.unberth': { en: 'Unberth', th: 'ออก' },

  // Tug Queue
  'tq.title': { en: 'Tug Queue Planner', th: 'จัดคิวเรือทัก' },
  'tq.sub': { en: 'Queue management by shift × size group', th: 'จัดคิวตามกะและขนาดเรือทัก' },
  'tq.queue': { en: 'Queue', th: 'คิว' },
  'tq.swap': { en: 'Swap', th: 'สลับ' },
  'tq.ready': { en: 'Ready', th: 'พร้อม' },

  // Tug Readiness
  'tr.title': { en: 'Tug Boat Readiness Log', th: 'สถานะเรือทักประจำวัน' },
  'tr.sub': { en: "Daily tug status per shift", th: 'สถานะประจำวันตามกะ' },
  'tr.remarks': { en: 'Remarks', th: 'หมายเหตุ' },
  'tr.saved': { en: 'Readiness saved ✓', th: 'บันทึกสถานะเรียบร้อย ✓' },

  // Shift Planner
  'sp.title': { en: 'Tug Shift Planner', th: 'ตารางกะคนประจำเรือ' },
  'sp.sub': { en: 'Monthly crew roster', th: 'ตารางกะรายเดือน' },
  'sp.employeeId': { en: 'Employee ID', th: 'รหัสพนักงาน' },
  'sp.firstName': { en: 'First Name', th: 'ชื่อ' },
  'sp.lastName': { en: 'Last Name', th: 'นามสกุล' },
  'sp.nickname': { en: 'Nickname', th: 'ชื่อเล่น' },
  'sp.tel': { en: 'Tel / Mobile', th: 'เบอร์โทร' },
  'sp.vessel': { en: 'Vessel', th: 'เรือ' },
  'sp.position': { en: 'Position', th: 'ตำแหน่ง' },
  'sp.leave': { en: 'Leave', th: 'วันลา' },
  'sp.uploadRoster': { en: 'Upload Roster', th: 'อัปโหลดตารางกะ' },
  'sp.addManual': { en: '+ Add Manual', th: '+ เพิ่มแมนนวล' },

  // Crew Assignment
  'ca.title': { en: 'Crew Assignment', th: 'คนประจำเรือ' },
  'ca.sub': { en: 'Assign crew × position × shift', th: 'จัดคนประจำเรือตามตำแหน่งและกะ' },
  'ca.unit': { en: 'Unit', th: 'หน่วยงาน' },
  'ca.group': { en: 'Group', th: 'กลุ่มเรือ' },
  'ca.crewMember': { en: 'Crew Member', th: 'พนักงาน' },
  'ca.licence': { en: 'e-unit Licence', th: 'ใบอนุญาต e-unit' },
  'ca.viewDoc': { en: 'View Doc', th: 'ดูเอกสาร' },

  // Berth Log
  'bl.title': { en: 'Vessel Berth / Unberth Log', th: 'บันทึกเรือเข้าออก' },
  'bl.sub': { en: 'Record actual berth / unberth events', th: 'บันทึกเหตุการณ์เข้าออกจริง' },
  'bl.vesselName': { en: 'Vessel Name', th: 'ชื่อเรือ' },
  'bl.berthTerminal': { en: 'Berth / Terminal', th: 'ท่าเรือ / หน้าท่า' },
  'bl.operationType': { en: 'Operation Type', th: 'ประเภทการปฏิบัติการ' },
  'bl.plannedDateTime': { en: 'Planned Date & Time', th: 'วันเวลาตามแผน' },
  'bl.draftForward': { en: 'Forward (F)', th: 'หัวเรือ' },
  'bl.draftMid': { en: 'Mid (M)', th: 'กลางเรือ' },
  'bl.draftAft': { en: 'Aft (A)', th: 'ท้ายเรือ' },
  'bl.pilotDetails': { en: 'Pilot details (name / licence / company)', th: 'รายละเอียดนำร่อง' },
  'bl.agentName': { en: 'Agent / Company', th: 'ตัวแทน / บริษัท' },
  'bl.contactPerson': { en: 'Contact Person', th: 'ผู้ติดต่อ' },
  'bl.tel': { en: 'Tel / Mobile', th: 'เบอร์โทร' },

  // Job Types — from client captain_app.html
  'jobType.label': { en: 'Job Type', th: 'ประเภทงาน' },
  'jobType.section': { en: 'Tug Job Type', th: 'ประเภทงานเรือ Tug' },
  'jobType.placeholder': { en: '— Select Job Type —', th: '— เลือกประเภทงาน —' },
  'jobType.berth_assist': { en: 'Berth Assist', th: 'ช่วยจอดเรือ' },
  'jobType.unberth_assist': { en: 'Unberth Assist', th: 'ช่วยออกเรือ' },
  'jobType.shifting': { en: 'Shifting', th: 'ย้ายเรือ' },
  'jobType.escort': { en: 'Escort', th: 'คุ้มกันเรือ' },
  'jobType.emergency': { en: 'Emergency Tow', th: 'ลากฉุกเฉิน' },
  'jobType.anchor_assist': { en: 'Anchor Assist', th: 'ช่วยทอดสมอ' },
  'jobType.standby': { en: 'Standby', th: 'เฝ้าระวัง' },
  'jobType.other': { en: 'Other', th: 'อื่นๆ' },

  'cap.crewAttendance': { en: 'Crew Attendance', th: 'การมาทำงาน' },
  'cap.present': { en: 'Present', th: 'มา' },
  'cap.absent': { en: 'Absent', th: 'ไม่มา' },
  'cap.tugAssigned': { en: 'Tug assigned', th: 'เรือทักที่จัด' },
  'cap.shipmentInfo': { en: 'Shipment Info', th: 'ข้อมูลงาน' },
  'cap.plannedTime': { en: 'Planned time', th: 'เวลาตามแผน' },

  // Captain App
  'cap.today': { en: "Today's Jobs", th: 'งานวันนี้' },
  'cap.selectTug': { en: 'Select Your Tug', th: 'เลือกเรือทักของคุณ' },
  'cap.vesselInfo': { en: 'Vessel Information', th: 'ข้อมูลเรือ' },
  'cap.assignment': { en: 'Assignment', th: 'งานที่ได้รับ' },
  'cap.tugGroup': { en: 'Tug Group', th: 'กลุ่มเรือทัก' },
  'cap.statusTimeline': { en: 'Status Timeline', th: 'ไทม์ไลน์สถานะ' },
  'cap.crewConfirm': { en: 'Crew Confirmation', th: 'ยืนยันลูกเรือ' },
  'cap.preDepartureCheck': { en: 'Pre-Departure Checklist', th: 'รายการตรวจก่อนออก' },
  'cap.record': { en: 'Record', th: 'บันทึก' },
  'cap.jobComplete': { en: 'Job Complete', th: 'งานเสร็จสิ้น' },

  // Stage names (for captain app)
  'stage.1': { en: 'Assignment Received', th: 'ได้รับมอบหมาย' },
  'stage.2': { en: 'Crew Check-In', th: 'ลูกเรือเช็คอิน' },
  'stage.3': { en: 'Pre-Departure Check', th: 'ตรวจสอบก่อนออก' },
  'stage.4': { en: 'Departed', th: 'ออกเดินทาง' },
  'stage.5': { en: 'Arrived at Station', th: 'ถึงจุดปฏิบัติงาน' },
  'stage.6': { en: 'Standby', th: 'รอเรือ' },
  'stage.7': { en: 'Made Fast', th: 'ผูกเชือกเสร็จ' },
  'stage.8': { en: 'Operation Active', th: 'ปฏิบัติงาน' },
  'stage.9': { en: 'Let Go', th: 'ปล่อยเชือก' },
  'stage.10': { en: 'Job Complete', th: 'งานเสร็จสิ้น' },

  // Crew app
  'crew.confirmWork': { en: 'Confirm Work', th: 'ยืนยันการทำงาน' },
  'crew.gpsReady': { en: 'GPS Ready', th: 'GPS พร้อม' },
  'crew.gpsWait': { en: 'Acquiring GPS...', th: 'กำลังรับสัญญาณ GPS...' },
  'crew.confirmed': { en: 'Confirmed', th: 'ยืนยันแล้ว' },
  'crew.undo': { en: 'Undo', th: 'ย้อนกลับ' },
  'crew.done': { en: 'Done', th: 'เสร็จสิ้น' },
}

export function t(key, lang = 'en') {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang] ?? entry.en ?? key
}
