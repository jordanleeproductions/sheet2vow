import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets/client';
import { 
  guestMapper, 
  budgetMapper, 
  scheduleMapper, 
  vendorMapper, 
  taskMapper 
} from '@/lib/sheets/mapper';
import { Guest, BudgetItem, ScheduleEvent, Vendor, Task, WeddingData } from '@/lib/sheets/types';

// Server-side in-memory store for Mock Mode testing
let mockDatabase: WeddingData = {
  dashboard: {
    totalBudget: 35000,
    estimatedCost: 32700,
    actualCost: 14200,
    remainingTasks: 4
  },
  guests: [
    { guestId: 'G1', firstName: 'Sarah', lastName: 'Connor', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Gluten Free', tableAssignment: 'Table 1', emailAddress: 'sarah@example.com', phoneNumber: '555-0199', mailingAddress: '123 Main St, LA' },
    { guestId: 'G2', firstName: 'John', lastName: 'Connor', partyGroup: 'Bride Family', ageCategory: 'Youth', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Table 1', emailAddress: 'john@example.com', phoneNumber: '555-0120', mailingAddress: '123 Main St, LA' },
    { guestId: 'G3', firstName: 'Marcus', lastName: 'Wright', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Declined', dietaryRestrictions: 'Vegan', tableAssignment: 'None', emailAddress: 'marcus@example.com', phoneNumber: '555-0143', mailingAddress: '456 Oak Rd, Chicago' },
    { guestId: 'G4', firstName: 'Kate', lastName: 'Brewster', partyGroup: 'Groom Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Table 2', emailAddress: 'kate@example.com', phoneNumber: '555-0187', mailingAddress: '789 Pine Ave, Seattle' },
    { guestId: 'G5', firstName: 'Tim', lastName: 'Brewster', partyGroup: 'Groom Family', ageCategory: 'Child', rsvpStatus: 'Attending', dietaryRestrictions: 'Nut Allergy', tableAssignment: 'Table 2', emailAddress: 'tim@example.com', phoneNumber: '555-0188', mailingAddress: '789 Pine Ave, Seattle' },
    { guestId: 'G6', firstName: 'Danny', lastName: 'Dyson', partyGroup: 'Bride Friends', ageCategory: 'Infant', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Table 1', emailAddress: 'danny@example.com', phoneNumber: '555-0155', mailingAddress: '321 Elm Blvd, Austin' },
    { guestId: 'G7', firstName: 'Miles', lastName: 'Dyson', partyGroup: 'Bride Friends', ageCategory: 'Adult', rsvpStatus: 'No Response', dietaryRestrictions: 'None', tableAssignment: 'Table 3', emailAddress: 'miles@example.com', phoneNumber: '555-0154', mailingAddress: '321 Elm Blvd, Austin' },
  ],
  budget: [
    { itemId: 'B1', category: 'Venue', vendorName: 'Grand Plaza Hall', estimatedCost: 15000, actualCost: 15000, amountPaid: 5000, dueDate: '2026-08-01', paymentStatus: 'Pending' },
    { itemId: 'B2', category: 'Catering', vendorName: 'Gourmet Delights', estimatedCost: 8000, actualCost: 7500, amountPaid: 7500, dueDate: '2026-07-15', paymentStatus: 'Paid' },
    { itemId: 'B3', category: 'Photography', vendorName: 'Golden Hour Photo', estimatedCost: 3500, actualCost: 3500, amountPaid: 1750, dueDate: '2026-09-10', paymentStatus: 'Pending' },
    { itemId: 'B4', category: 'Attire', vendorName: 'Vows & Veils Boutique', estimatedCost: 2500, actualCost: 2800, amountPaid: 2800, dueDate: '2026-05-20', paymentStatus: 'Paid' },
    { itemId: 'B5', category: 'Florals', vendorName: 'Bloom & Petal', estimatedCost: 2000, actualCost: 2200, amountPaid: 0, dueDate: '2026-10-01', paymentStatus: 'Pending' },
    { itemId: 'B6', category: 'Music/DJ', vendorName: 'BeatDrop Entertainment', estimatedCost: 1700, actualCost: 1700, amountPaid: 1700, dueDate: '2026-07-01', paymentStatus: 'Paid' },
  ],
  schedule: [
    { startTime: '08:00 AM', endTime: '10:00 AM', eventMoment: 'Hair & Makeup Styling', location: 'Bridal Suite', responsibility: 'Glam Team (Vows & Veils)', notes: 'Bride & Bridesmaids need to start on time. Mimosas and fruit platter served.' },
    { startTime: '11:00 AM', endTime: '12:00 PM', eventMoment: 'Groom Prep & Portraits', location: 'Hotel Lounge', responsibility: 'Groom, Groomsmen, Photographer', notes: 'Detail shots of rings, watch, and suit.' },
    { startTime: '01:30 PM', endTime: '02:30 PM', eventMoment: 'First Look & Couple Portraits', location: 'Garden Path', responsibility: 'Photographer, Planner', notes: 'Keep guests away. Sunset point backup if rain.' },
    { startTime: '04:00 PM', endTime: '04:30 PM', eventMoment: 'Ceremony Service', location: 'Courtyard Lawn', responsibility: 'Officiant, Musicians', notes: 'Live harp starts playing at 3:30 PM as guests sit.' },
    { startTime: '05:00 PM', endTime: '06:00 PM', eventMoment: 'Cocktail Hour', location: 'West Terrace', responsibility: 'Caterer, Bartenders', notes: 'Open bar, 4 tray-passed hors d\'oeuvres. Family photos taken.' },
    { startTime: '06:30 PM', endTime: '10:00 PM', eventMoment: 'Reception & Dinner', location: 'Grand Ballroom', responsibility: 'DJ, Caterer, MC', notes: 'First dance at 6:45 PM. Cake cutting at 8:30 PM.' },
  ],
  vendors: [
    { vendorId: 'V1', vendorName: 'Grand Plaza Hall', category: 'Venue', contactName: 'Evelyn Bennett', emailAddress: 'evelyn@grandplaza.com', phoneNumber: '555-9081', totalContractValue: 15000, depositPaid: 5000, balanceOwing: 10000, paymentDueDate: '2026-08-01', contractLink: 'https://example.com/contracts/venue.pdf', staffMealsRequired: 'No' },
    { vendorId: 'V2', vendorName: 'Gourmet Delights', category: 'Catering', contactName: 'Chef Robert', emailAddress: 'robert@gourmetdelights.net', phoneNumber: '555-2241', totalContractValue: 7500, depositPaid: 7500, balanceOwing: 0, paymentDueDate: '2026-07-15', contractLink: 'https://example.com/contracts/catering.pdf', staffMealsRequired: 'Yes' },
    { vendorId: 'V3', vendorName: 'Golden Hour Photo', category: 'Photography', contactName: 'Mark Vance', emailAddress: 'mark@goldenhour.com', phoneNumber: '555-7033', totalContractValue: 3500, depositPaid: 1750, balanceOwing: 1750, paymentDueDate: '2026-09-10', contractLink: 'https://example.com/contracts/photo.pdf', staffMealsRequired: 'Yes' },
    { vendorId: 'V4', vendorName: 'Bloom & Petal', category: 'Florals', contactName: 'Jessica Rose', emailAddress: 'jessica@bloompetal.com', phoneNumber: '555-1294', totalContractValue: 2200, depositPaid: 0, balanceOwing: 2200, paymentDueDate: '2026-10-01', contractLink: 'https://example.com/contracts/florals.pdf', staffMealsRequired: 'No' },
    { vendorId: 'V5', vendorName: 'BeatDrop Entertainment', category: 'Music/DJ', contactName: 'DJ Spark', emailAddress: 'spark@beatdrop.fm', phoneNumber: '555-8832', totalContractValue: 1700, depositPaid: 1700, balanceOwing: 0, paymentDueDate: '2026-07-01', contractLink: 'https://example.com/contracts/dj.pdf', staffMealsRequired: 'Yes' },
  ],
  tasks: [
    { taskId: 'T1', taskName: 'Finalize Guest Seating Chart', kanbanStage: 'In Progress', category: 'Guests', priority: 'High', assignedTo: 'Sarah', dueDate: '2026-08-15', notes: 'Wait for RSVPs before final assignments.' },
    { taskId: 'T2', taskName: 'Approve Catering Menu', kanbanStage: 'Done', category: 'Catering', priority: 'High', assignedTo: 'John & Sarah', dueDate: '2026-07-10', notes: 'Tasting completed. Pork belly & Sea bass selected.' },
    { taskId: 'T3', taskName: 'Purchase Groomsmen Suits', kanbanStage: 'To Do', category: 'Attire', priority: 'Medium', assignedTo: 'John', dueDate: '2026-07-30', notes: 'Fittings scheduled for next Saturday.' },
    { taskId: 'T4', taskName: 'Submit Marriage License App', kanbanStage: 'To Do', category: 'Legal', priority: 'High', assignedTo: 'John & Sarah', dueDate: '2026-08-01', notes: 'Need to bring certified birth certificates.' },
    { taskId: 'T5', taskName: 'Order Wedding Cake', kanbanStage: 'In Progress', category: 'Catering', priority: 'Medium', assignedTo: 'Sarah', dueDate: '2026-08-10', notes: '3-tier vanilla almond cake with gold foil details.' },
    { taskId: 'T6', taskName: 'Book Wedding Night Suite', kanbanStage: 'Done', category: 'Venue', priority: 'Low', assignedTo: 'John', dueDate: '2026-06-01', notes: 'Booked at Plaza Suite. Late checkout confirmed.' },
    { taskId: 'T7', taskName: 'Write Wedding Vows', kanbanStage: 'To Do', category: 'Personal', priority: 'Medium', assignedTo: 'John & Sarah', dueDate: '2026-09-01', notes: 'Write in personal vows notebooks.' },
    { taskId: 'T8', taskName: 'Confirm Song Lists with DJ', kanbanStage: 'To Do', category: 'Music', priority: 'Low', assignedTo: 'John', dueDate: '2026-09-05', notes: 'Submit do-not-play list.' },
  ]
};

let mockWeddingName = 'Our Wedding';

// Map sheet columns to standard header lists so that we can write files correctly
const HEADERS_MAP = {
  guests: ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Table Assignment', 'Email Address', 'Phone Number', 'Mailing Address'],
  budget: ['Item ID', 'Category', 'Vendor Name', 'Estimated Cost', 'Actual Cost', 'Amount Paid', 'Due Date', 'Payment Status'],
  schedule: ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility / Vendors', 'Notes / Details'],
  vendors: ['Vendor ID', 'Vendor Name', 'Category', 'Contact Name', 'Email Address', 'Phone Number', 'Total Contract Value', 'Deposit Paid', 'Balance Owing', 'Payment Due Date', 'Contract Link', 'Staff Meals Required'],
  tasks: ['Task ID', 'Task Name', 'Kanban Stage', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Notes / Links']
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId is required' }, { status: 400 });
    }

    // Mock Mode
    if (!accessToken || accessToken === 'mock-token' || spreadsheetId === 'mock-sheet-id-vow-12345') {
      // Dynamically calculate metrics for consistency in mock mode
      const estimatedCost = mockDatabase.budget.reduce((sum, item) => sum + item.estimatedCost, 0);
      const actualCost = mockDatabase.budget.reduce((sum, item) => sum + item.actualCost, 0);
      const remainingTasks = mockDatabase.tasks.filter(task => task.kanbanStage === 'To Do').length;

      mockDatabase.dashboard = {
        ...mockDatabase.dashboard,
        estimatedCost,
        actualCost,
        remainingTasks
      };

      return NextResponse.json({
        success: true,
        data: mockDatabase,
        weddingName: mockWeddingName,
        isMock: true
      });
    }

    const sheetsClient = getSheetsClient(accessToken);

    // Fetch all spreadsheet tabs in a single atomic batch get
    const batchGetResponse = await sheetsClient.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        "'Dashboard'!B2",
        "'Guest List'!A1:K1000",
        "'Budget Ledger'!A1:H1000",
        "'Day-Of-Schedule'!A1:F1000",
        "'Vendors'!A1:L1000",
        "'To-Do List'!A1:H1000"
      ]
    });

    const valueRanges = batchGetResponse.data.valueRanges || [];
    
    // Parse Dashboard (Cell B2 config JSON or numeric budget)
    const dashboardVal = valueRanges[0]?.values?.[0]?.[0] || '';
    let totalBudget = 30000;
    let weddingName = 'Our Wedding';
    
    try {
      if (dashboardVal.startsWith('{')) {
        const parsed = JSON.parse(dashboardVal);
        totalBudget = Number(parsed.budget) || 30000;
        weddingName = parsed.weddingName || 'Our Wedding';
      } else {
        totalBudget = Number(dashboardVal) || 30000;
      }
    } catch {
      totalBudget = Number(dashboardVal) || 30000;
    }

    // Parse Guest List
    const guestRows = valueRanges[1]?.values || [];
    const guestHeaders = guestRows[0] || HEADERS_MAP.guests;
    const guests = guestRows.slice(1).map(row => guestMapper.fromRow(guestHeaders, row));

    // Parse Budget Ledger
    const budgetRows = valueRanges[2]?.values || [];
    const budgetHeaders = budgetRows[0] || HEADERS_MAP.budget;
    const budget = budgetRows.slice(1).map(row => budgetMapper.fromRow(budgetHeaders, row));

    // Parse Day-Of-Schedule
    const scheduleRows = valueRanges[3]?.values || [];
    const scheduleHeaders = scheduleRows[0] || HEADERS_MAP.schedule;
    const schedule = scheduleRows.slice(1).map(row => scheduleMapper.fromRow(scheduleHeaders, row));

    // Parse Vendors
    const vendorRows = valueRanges[4]?.values || [];
    const vendorHeaders = vendorRows[0] || HEADERS_MAP.vendors;
    const vendors = vendorRows.slice(1).map(row => vendorMapper.fromRow(vendorHeaders, row));

    // Parse To-Do List
    const taskRows = valueRanges[5]?.values || [];
    const taskHeaders = taskRows[0] || HEADERS_MAP.tasks;
    const tasks = taskRows.slice(1).map(row => taskMapper.fromRow(taskHeaders, row));

    // Calculate dynamic values for Dashboard UI
    const estimatedCost = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
    const actualCost = budget.reduce((sum, item) => sum + item.actualCost, 0);
    const remainingTasks = tasks.filter(t => t.kanbanStage === 'To Do').length;

    const data: WeddingData = {
      dashboard: {
        totalBudget,
        estimatedCost,
        actualCost,
        remainingTasks
      },
      guests,
      budget,
      schedule,
      vendors,
      tasks
    };

    return NextResponse.json({
      success: true,
      data,
      weddingName,
      isMock: false
    });

  } catch (error: any) {
    console.error('Error fetching sheet data in /api/sync:', error);
    return NextResponse.json({ success: false, error: error.message || 'Sync load failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const body = await req.json();
    const { spreadsheetId, sheetType, data } = body;

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId is required' }, { status: 400 });
    }
    if (!sheetType) {
      return NextResponse.json({ success: false, error: 'sheetType is required' }, { status: 400 });
    }

    // Mock Mode Update
    if (!accessToken || accessToken === 'mock-token' || spreadsheetId === 'mock-sheet-id-vow-12345') {
      if (sheetType === 'dashboard') {
        mockDatabase.dashboard.totalBudget = Number(data.budget) || mockDatabase.dashboard.totalBudget;
        mockWeddingName = data.weddingName || 'Our Wedding';
      } else if (sheetType === 'guests') {
        mockDatabase.guests = data as Guest[];
      } else if (sheetType === 'budget') {
        mockDatabase.budget = data as BudgetItem[];
      } else if (sheetType === 'schedule') {
        mockDatabase.schedule = data as ScheduleEvent[];
      } else if (sheetType === 'vendors') {
        mockDatabase.vendors = data as Vendor[];
      } else if (sheetType === 'tasks') {
        mockDatabase.tasks = data as Task[];
      }

      // Recompute metrics
      const estimatedCost = mockDatabase.budget.reduce((sum, item) => sum + item.estimatedCost, 0);
      const actualCost = mockDatabase.budget.reduce((sum, item) => sum + item.actualCost, 0);
      const remainingTasks = mockDatabase.tasks.filter(task => task.kanbanStage === 'To Do').length;

      mockDatabase.dashboard = {
        ...mockDatabase.dashboard,
        estimatedCost,
        actualCost,
        remainingTasks
      };

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${sheetType} in Mock Mode.`,
        data: mockDatabase,
        isMock: true
      });
    }

    const sheetsClient = getSheetsClient(accessToken);

    if (sheetType === 'dashboard') {
      // Update cell B2
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: "'Dashboard'!B2",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[JSON.stringify({ budget: data.budget, weddingName: data.weddingName })]],
        },
      });
    } else {
      // Overwrite the sheet rows
      let range = '';
      let values: any[][] = [];
      const headers = HEADERS_MAP[sheetType as keyof typeof HEADERS_MAP];
      
      // Setup the header row
      values.push(headers);

      if (sheetType === 'guests') {
        range = "'Guest List'!A1:K1000";
        (data as Guest[]).forEach(item => {
          values.push(guestMapper.toRow(headers, item));
        });
      } else if (sheetType === 'budget') {
        range = "'Budget Ledger'!A1:H1000";
        (data as BudgetItem[]).forEach(item => {
          values.push(budgetMapper.toRow(headers, item));
        });
      } else if (sheetType === 'schedule') {
        range = "'Day-Of-Schedule'!A1:F1000";
        (data as ScheduleEvent[]).forEach(item => {
          values.push(scheduleMapper.toRow(headers, item));
        });
      } else if (sheetType === 'vendors') {
        range = "'Vendors'!A1:L1000";
        (data as Vendor[]).forEach(item => {
          values.push(vendorMapper.toRow(headers, item));
        });
      } else if (sheetType === 'tasks') {
        range = "'To-Do List'!A1:H1000";
        (data as Task[]).forEach(item => {
          values.push(taskMapper.toRow(headers, item));
        });
      }

      // To prevent stale cells if new data is shorter, we clear first
      const clearRange = range.replace('1', '2'); // e.g. 'Guest List'!A2:K1000
      await sheetsClient.spreadsheets.values.clear({
        spreadsheetId,
        range: clearRange,
      });

      // Update values
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${sheetType} to Google Sheets.`
    });

  } catch (error: any) {
    console.error('Error synchronizing sheet data in /api/sync:', error);
    return NextResponse.json({ success: false, error: error.message || 'Sync save failed' }, { status: 500 });
  }
}
