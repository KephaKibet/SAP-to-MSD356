using System.ComponentModel.DataAnnotations;

namespace SAP_MSD.Models
{
	public class SaptoMsd
	{
        public int Id { get; set; }
        public string? SapNumber { get; set; }
        public string? MsdNumber { get; set; }
        public string? MrpType { get; set; }
        public string? Bin { get; set; }
        public string? Min { get; set; }
        public string? Max { get; set; }
        public decimal AveragePrice { get; set; }
	}
}
