import { Complaint, Officer, Department, ComplaintCategory } from '../types';
import { StorageService } from './storage';

export interface AssignmentResult {
  assignedOfficer: Officer;
  department: Department;
  reason: string;
  score: number;
}

export class AssignmentEngine {
  static assignComplaint(complaint: Partial<Complaint>): AssignmentResult | null {
    const departments = StorageService.getDepartments();
    const officers = StorageService.getOfficers();
    const category = complaint.category as ComplaintCategory;

    // 1. Identify relevant Department matching category
    let targetDept = departments.find(d => d.categories.includes(category));
    if (!targetDept) {
      targetDept = departments[0]; // fallback to default
    }

    // 2. Identify eligible officers in that department
    let eligibleOfficers = officers.filter(
      o => o.departmentId === targetDept!.id && o.status !== 'leave'
    );

    if (eligibleOfficers.length === 0) {
      eligibleOfficers = officers.filter(o => o.status !== 'leave');
    }

    if (eligibleOfficers.length === 0) {
      return null;
    }

    // 3. Workload and Jurisdiction scoring
    // Score based on: (maxCapacity - activeCasesCount) * 10 + (location / jurisdiction match bonus) + rating * 2
    let bestOfficer: Officer = eligibleOfficers[0];
    let highestScore = -999;
    let selectedReason = '';

    for (const officer of eligibleOfficers) {
      const remainingCapacity = officer.maxCapacity - officer.activeCasesCount;
      let score = remainingCapacity * 20;

      // Bonus for high officer rating
      score += (officer.rating || 4.5) * 5;

      // Location / jurisdiction match bonus
      if (
        complaint.incidentLocation &&
        officer.jurisdiction.toLowerCase().includes(complaint.incidentLocation.district.toLowerCase())
      ) {
        score += 30;
      }

      if (score > highestScore) {
        highestScore = score;
        bestOfficer = officer;
        selectedReason = `Assigned based on available bandwidth (${officer.activeCasesCount}/${officer.maxCapacity} active cases), ${officer.unitName} specialization, and ${officer.jurisdiction} jurisdictional proximity.`;
      }
    }

    // 4. Update the officer's activeCasesCount in storage
    const updatedOfficers = officers.map(o => {
      if (o.id === bestOfficer.id) {
        return { ...o, activeCasesCount: o.activeCasesCount + 1 };
      }
      return o;
    });
    StorageService.saveOfficers(updatedOfficers);

    return {
      assignedOfficer: bestOfficer,
      department: targetDept,
      reason: selectedReason,
      score: highestScore
    };
  }

  static reassignComplaint(
    complaintId: string,
    newOfficerId: string,
    supervisorName: string,
    reason: string
  ): { updatedComplaint: Complaint; officer: Officer } | null {
    const complaints = StorageService.getComplaints();
    const officers = StorageService.getOfficers();

    const complaint = complaints.find(c => c.id === complaintId);
    const newOfficer = officers.find(o => o.id === newOfficerId);

    if (!complaint || !newOfficer) {
      return null;
    }

    const oldOfficerId = complaint.assignedOfficerId;

    // Update officers workload
    const updatedOfficers = officers.map(o => {
      if (o.id === newOfficer.id) {
        return { ...o, activeCasesCount: o.activeCasesCount + 1 };
      }
      if (oldOfficerId && o.id === oldOfficerId) {
        return { ...o, activeCasesCount: Math.max(0, o.activeCasesCount - 1) };
      }
      return o;
    });
    StorageService.saveOfficers(updatedOfficers);

    // Update complaint
    complaint.assignedOfficerId = newOfficer.id;
    complaint.assignedOfficerName = newOfficer.name;
    complaint.assignedOfficerBadge = newOfficer.badgeNumber;
    complaint.department = newOfficer.departmentName;
    complaint.unit = newOfficer.unitName;
    complaint.jurisdiction = newOfficer.jurisdiction;
    complaint.updatedAt = new Date().toISOString();

    StorageService.saveComplaints(complaints);

    return {
      updatedComplaint: complaint,
      officer: newOfficer
    };
  }
}
