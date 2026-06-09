# Import base first, then dependent models
from .user import User
from .doctor import Doctor          # Doctor has no foreign key to Appointment
from .patient import Patient        # Patient references Appointment (string)
from .appointment import Appointment # Must come after Patient because Appointment references Patient & Doctor
from .medical_record import MedicalRecord
from .prescription import Prescription
from .invoice import Invoice